import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Ban, CarFront, Check, Plus, RefreshCw, Search, Send, UserRound, X } from 'lucide-react';
import { quote, waitingCents } from '../../domain/pricing';
import { checkSchedule, type Allocation } from '../../domain/calendar';
import { checkLeadTime } from '../../domain/lead-time';
import { normalizeBookingReference } from '../../contracts/lookup';
import { changeEligibility } from '../../domain/policy';
import { Button } from '../../ui/components/Button';
import { Row } from '../../ui/components/Primitives';
import { demoTrips } from './DemoPage';
import { RouteMap } from '../components/RouteMap';
import { tourRoute, transferRoutes, type DemoRoute } from '../demo-routes';

const drivers = ['Miguel Costa', 'Sofia Martins', 'André Ribeiro'];
const cars = [
  { name: 'Mercedes-Benz Classe E', driver: 0, capacity: 4 },
  { name: 'Mercedes-Benz Classe V', driver: 0, capacity: 6 },
  { name: 'BMW Série 5', driver: 1, capacity: 4 },
  { name: 'Volvo XC90', driver: 2, capacity: 6 },
];
const clock = '2026-09-10T08:00:00Z';
type ServiceKind = 'transfer' | 'tour';
type CustomerRouteHandoff = { kind: ServiceKind; origin: string; destination: string; stops: string[]; route: DemoRoute };
type Request = {
  id: string;
  allocation: Allocation;
  driver: number;
  car: number;
  service: ServiceKind;
  routeIndex: number;
  origin: string;
  destination: string;
  stops: string[];
  customRoute?: DemoRoute;
  people: number;
  name: string;
  email: string;
  phone: string;
  nif: string;
  total: number;
  deposit: number;
  balance: number;
  cancelled: boolean;
  rescheduled: boolean;
};
let requests: Request[] = [];
const seed: Allocation[] = demoTrips.map(trip => ({ id: trip.id, driverId: String(trip.driver), vehicleId: String(trip.car), startsAt: `${trip.day}T${trip.time}:00+01:00`, endsAt: `${trip.day}T${trip.end}:00+01:00`, status: 'confirmed' }));

function readCustomerRouteHandoff(): CustomerRouteHandoff | null {
  try {
    const raw = window.sessionStorage.getItem('pm.customer.route-handoff');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CustomerRouteHandoff>;
    const route = parsed.route as DemoRoute | undefined;
    if ((parsed.kind !== 'tour' && parsed.kind !== 'transfer') || typeof parsed.origin !== 'string' || typeof parsed.destination !== 'string' || !Array.isArray(parsed.stops) || !route || !Array.isArray(route.points) || !Array.isArray(route.shape)) return null;
    return {
      kind: parsed.kind,
      origin: parsed.origin,
      destination: parsed.destination,
      stops: parsed.stops.filter((stop): stop is string => typeof stop === 'string' && Boolean(stop.trim())),
      route,
    };
  } catch {
    return null;
  }
}

function routeSummary(origin: string, destination: string, stops: readonly string[]) {
  return [origin, ...stops, destination].filter(place => place.trim()).join(' → ');
}

function labelledRoute(route: DemoRoute, origin: string, destination: string): DemoRoute {
  const points = route.points.map((point, index) => index === 0 ? { ...point, label: origin } : index === route.points.length - 1 ? { ...point, label: destination } : point);
  return { ...route, name: `${origin} → ${destination}`, points };
}

export default function CustomerSandbox({ page }: { page: string }) {
  const { i18n } = useTranslation();
  const say = (pt: string, en: string) => i18n.language === 'en' ? en : pt;
  const [handoff] = useState<CustomerRouteHandoff | null>(() => readCustomerRouteHandoff());
  useEffect(() => {
    if (!handoff) return;
    try { window.sessionStorage.removeItem('pm.customer.route-handoff'); } catch { /* optional handoff cleanup */ }
  }, [handoff]);
  const initialTour = new URLSearchParams(window.location.search).get('tour') === '1';
  const money = (n: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(n / 100);
  const [step, setStep] = useState(handoff ? 2 : 1);
  const [service, setService] = useState<ServiceKind>(handoff?.kind ?? (initialTour ? 'tour' : 'transfer'));
  const [route, setRoute] = useState(0);
  const [origin, setOrigin] = useState(handoff?.origin ?? (initialTour ? 'Lisboa' : 'Aeroporto de Lisboa'));
  const [destination, setDestination] = useState(handoff?.destination ?? (initialTour ? 'Sintra' : 'Cascais'));
  const [stops, setStops] = useState<string[]>(handoff?.stops ?? []);
  const [customRoute, setCustomRoute] = useState<DemoRoute | null>(handoff?.route ?? null);
  const [locationState, setLocationState] = useState<'suggested' | 'requesting' | 'fallback'>('suggested');
  const [driver, setDriver] = useState(0);
  const [car, setCar] = useState(0);
  const [people, setPeople] = useState(2);
  const [start, setStart] = useState('2026-09-14T10:00');
  const [wait, setWait] = useState(0);
  const [name, setName] = useState('Ana Exemplo');
  const [email, setEmail] = useState('cliente@example.invalid');
  const [phone, setPhone] = useState('+351 910 000 000');
  const [nif, setNif] = useState('123456789');
  const [error, setError] = useState('');
  const [current, setCurrent] = useState<Request | null>(null);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<Request | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [history, setHistory] = useState(requests);

  const baseRoute = customRoute ?? (service === 'tour' ? tourRoute : transferRoutes[route]);
  const previewRoute = customRoute ?? labelledRoute(baseRoute, origin || baseRoute.points[0].label, destination || baseRoute.points[baseRoute.points.length - 1].label);
  const price = quote({
    passengers: people,
    passengerCapacity: Math.max(cars[car].capacity, people),
    service: service === 'tour' ? { kind: 'tour', baseCents: 20000, extraPassengerCents: 3500 } : { kind: 'transfer', baseCents: 1000, distanceMeters: baseRoute.meters, centsPerKm: 200 },
    extras: [{ code: 'waiting', cents: waitingCents(wait, 0, 15, 2400) }],
  });
  const line = (code: string) => price.lines.find(item => item.code === code)?.cents ?? 0;
  const km = new Intl.NumberFormat(i18n.language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(baseRoute.meters / 1000);

  const useLocation = () => {
    setLocationState('requesting');
    setCustomRoute(null);
    if (!navigator.geolocation) {
      setOrigin('Lisboa');
      setLocationState('fallback');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => { setOrigin('Localização atual (teste)'); setLocationState('suggested'); },
      () => { setOrigin('Lisboa'); setLocationState('fallback'); },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
    );
  };
  const selectDestination = (value: string) => {
    setCustomRoute(null);
    setDestination(value);
    const match = transferRoutes.findIndex(item => item.points[item.points.length - 1].label.toLocaleLowerCase() === value.trim().toLocaleLowerCase());
    if (match >= 0) setRoute(match);
  };
  const selectService = (value: ServiceKind) => {
    setCustomRoute(null);
    setService(value);
    if (value === 'tour') { setOrigin('Lisboa'); setDestination('Cabo da Roca'); }
    else { setOrigin('Aeroporto de Lisboa'); setDestination('Cascais'); setRoute(0); }
  };
  const validateRouteStep = () => {
    setError('');
    if (!origin.trim() || !destination.trim()) { setError(say('Indique a origem e o destino para continuar.', 'Enter pickup and destination to continue.')); return false; }
    const date = DateTime.fromISO(start, { zone: 'Europe/Lisbon' });
    if (!date.isValid || date.toFormat("yyyy-MM-dd'T'HH:mm") !== start || date.getPossibleOffsets().length !== 1) { setError(say('Escolha uma hora de Lisboa válida e sem ambiguidade.', 'Choose a valid, unambiguous Lisbon time.')); return false; }
    return true;
  };
  const validateDriverStep = () => {
    setError('');
    if (people > cars[car].capacity) { setError(say(`Este carro aceita até ${cars[car].capacity} passageiros. Escolha outro carro.`, `This car accepts up to ${cars[car].capacity} passengers. Choose another vehicle.`)); return false; }
    return true;
  };
  const validateAllocation = (): Allocation | null => {
    setError('');
    if (!validateRouteStep() || !validateDriverStep()) return null;
    const date = DateTime.fromISO(start, { zone: 'Europe/Lisbon' });
    const lead = checkLeadTime(clock, date.toUTC().toISO()!, service);
    if (!lead.eligible) { setError(say(`Antecedência mínima: ${lead.requiredMinutes / 60} horas desde o relógio de teste.`, `Minimum notice: ${lead.requiredMinutes / 60} hours from the test clock.`)); return null; }
    const candidate: Allocation = { id: `CLIENT-${crypto.randomUUID().slice(0, 8)}`, driverId: String(driver), vehicleId: String(car), startsAt: date.toUTC().toISO()!, endsAt: date.plus({ minutes: baseRoute.minutes + wait }).toUTC().toISO()!, status: 'requested', holdExpiresAt: DateTime.fromISO(clock).plus({ minutes: 30 }).toISO()! };
    const result = checkSchedule(candidate, [...seed, ...requests.map(item => item.allocation)], clock, { minimumGapMinutes: 60, delayAllowanceMinutes: 15 }, () => 30);
    if (!result.available) { setError(say('Horário indisponível para este motorista ou carro. Escolha outra hora ou recurso.', 'Time unavailable for this driver or vehicle. Choose another time or resource.')); return null; }
    return candidate;
  };
  const advance = () => {
    if (step === 1 && validateRouteStep()) setStep(2);
    else if (step === 2 && validateDriverStep()) setStep(3);
    else if (step === 3) { setError(''); setStep(4); }
  };
  const requestRoute = (request: Request) => request.customRoute ?? labelledRoute(request.service === 'tour' ? tourRoute : transferRoutes[request.routeIndex], request.origin, request.destination);
  const reschedule = (request: Request) => {
    const eligibility = changeEligibility(clock, request.allocation.startsAt, request.allocation.startsAt);
    if (!eligibility.rescheduleEligible) { setLookupError(say('Fora da janela de 24 horas.', 'Outside the 24-hour window.')); return; }
    const allocation = { ...request.allocation, startsAt: DateTime.fromISO(request.allocation.startsAt).plus({ hours: 1 }).toUTC().toISO()!, endsAt: DateTime.fromISO(request.allocation.endsAt).plus({ hours: 1 }).toUTC().toISO()! };
    const result = checkSchedule(allocation, [...seed, ...requests.filter(item => item.id !== request.id).map(item => item.allocation)], clock, { minimumGapMinutes: 60, delayAllowanceMinutes: 15 }, () => 30);
    if (!result.available) { setLookupError(say('Novo horário indisponível.', 'New time unavailable.')); return; }
    const next = { ...request, allocation, rescheduled: true };
    requests = requests.map(item => item.id === request.id ? next : item);
    setHistory([...requests]);
    if (current?.id === request.id) setCurrent(next);
    if (lookupResult?.id === request.id) setLookupResult(next);
    setLookupError('');
  };
  const record = (request: Request) => <article className="pm-card pm-demo-record" key={request.id}><h2>{request.id}</h2><p role="status">{request.cancelled ? say('Pedido de teste cancelado', 'Test request cancelled') : say('A aguardar aceitação do motorista', 'Awaiting driver acceptance')}</p><p>{routeSummary(request.origin, request.destination, request.stops)}</p><p>{DateTime.fromISO(request.allocation.startsAt).setZone('Europe/Lisbon').toFormat('dd/MM/yyyy HH:mm')} · {drivers[request.driver]} · {cars[request.car].name}</p><Row label={say('Passageiros', 'Passengers')} value={request.people}/><Row label={say('Total', 'Total')} value={money(request.total)}/><Row label={say('Sinal após aceitação · 25%', 'Deposit after acceptance · 25%')} value={money(request.deposit)}/><Row label={say('Saldo no início', 'Balance at pickup')} value={money(request.balance)}/><p>{say('Ainda não foi pago qualquer valor. O sinal só será pedido depois do aceite do motorista.', 'Nothing has been paid. The deposit is requested only after driver acceptance.')}</p>{!request.cancelled && <Button variant="secondary" onClick={() => { const next = { ...request, cancelled: true, allocation: { ...request.allocation, status: 'cancelled' as const } }; requests = requests.map(item => item.id === request.id ? next : item); setHistory([...requests]); if (current?.id === request.id) setCurrent(next); if (lookupResult?.id === request.id) setLookupResult(next); }}><Ban size={17} aria-hidden="true" />{say('Cancelar pedido de teste', 'Cancel test request')}</Button>}{!request.cancelled && <Button variant="secondary" disabled={!changeEligibility(clock, request.allocation.startsAt, request.allocation.startsAt).rescheduleEligible} onClick={() => reschedule(request)}><RefreshCw size={17} aria-hidden="true" />{say('Pedir reagendamento (+1h)', 'Request reschedule (+1h)')}</Button>}</article>;

  return <>
    <p className="pm-note">{say('Experiência de cliente — dados fictícios. Relógio de teste: 10/09/2026, 09:00 Lisboa. Distâncias e preços de exemplo; não existe cobrança.', 'Customer experience — fictional data. Test clock: 10 September 2026, 09:00 Lisbon. Example distances and prices; no charges.')}</p>
    {page === 'lookup' ? <><form className="pm-card pm-demo-form" aria-label={say('Consultar reserva', 'Find booking')} onSubmit={event => { event.preventDefault(); const normalized = normalizeBookingReference(lookupCode); const found = normalized ? history.find(item => item.id === normalized) : null; if (!found) { setLookupError(say('Código não encontrado nesta sessão de teste.', 'Code not found in this test session.')); setLookupResult(null); return; } setLookupError(''); setLookupResult(found); }}><label>{say('Código de confirmação', 'Confirmation code')}<input value={lookupCode} onChange={event => setLookupCode(event.target.value)} placeholder="CLIENT-XXXXXXXX" autoComplete="off"/></label>{lookupError && <p role="alert">{lookupError}</p>}<div className="pm-actions"><Button type="submit"><Search size={17} aria-hidden="true" />{say('Consultar', 'Look up')}</Button>{lookupResult && <Button type="button" variant="secondary" onClick={() => { setLookupResult(null); setLookupCode(''); setLookupError(''); }}><X size={17} aria-hidden="true" />{say('Limpar consulta', 'Clear lookup')}</Button>}</div></form>{lookupResult && <><RouteMap route={requestRoute(lookupResult)} language={i18n.language === 'en' ? 'en' : 'pt'}/>{record(lookupResult)}</>}<h2>{say('Os meus pedidos de teste', 'My test requests')}</h2>{history.length ? history.map(record) : <p>{say('Ainda não criou pedidos nesta sessão.', 'No requests created in this session yet.')}</p>}<Button asChild><a href="#/customer/booking"><Plus size={17} aria-hidden="true" />{say('Marcar viagem', 'Book a trip')}</a></Button></> : current ? <><RouteMap route={requestRoute(current)} language={i18n.language === 'en' ? 'en' : 'pt'}/>{record(current)}<Button asChild><a href="#/customer/lookup"><Search size={17} aria-hidden="true" />{say('Consultar pedidos', 'View requests')}</a></Button></> : <>
      <p className="pm-step-progress"><span>{say('Passo', 'Step')} {step}/4</span><span aria-hidden="true">·</span><strong>{['', say('Percurso', 'Route'), say('Motorista e carro', 'Driver and vehicle'), say('Os seus dados', 'Your details'), say('Rever pedido', 'Review request')][step]}</strong></p>
      <form className="pm-card pm-demo-form pm-customer-booking" onSubmit={event => { event.preventDefault(); if (step === 4) { const allocation = validateAllocation(); if (!allocation) return; const request: Request = { id: allocation.id, allocation, driver, car, service, routeIndex: route, origin: origin.trim(), destination: destination.trim(), stops: [...stops], customRoute: customRoute ?? undefined, people, name, email, phone, nif, total: price.totalCents, deposit: price.depositCents, balance: price.balanceCents, cancelled: false, rescheduled: false }; requests = [...requests, request]; setHistory(requests); setCurrent(request); return; } advance(); }}>
        {step === 1 && <section className="pm-route-entry"><h2>{say('Para onde vai?', 'Where are you going?')}</h2><p className="pm-secondary">{say('Indique o destino. A origem é sugerida pela sua localização e pode ser editada.', 'Enter your destination. Pickup is suggested from your location and can be edited.')}</p><label>{say('Destino', 'Destination')}<input list="pm-destination-options" value={destination} onChange={event => selectDestination(event.target.value)} placeholder={say('Ex.: Cascais', 'e.g. Cascais')} required/><datalist id="pm-destination-options"><option value="Cascais"/><option value="Sintra"/><option value="Setúbal"/></datalist></label><label>{say('Origem', 'Pickup')}<input value={origin} onChange={event => { setCustomRoute(null); setOrigin(event.target.value); }} required/></label><Button type="button" variant="secondary" className="pm-location-button" onClick={useLocation}>{locationState === 'requesting' ? say('A localizar…', 'Locating…') : say('Usar localização atual', 'Use current location')}</Button><p className="pm-field-help">{locationState === 'fallback' ? say('Localização indisponível; Lisboa foi preenchida como exemplo. Confirme a origem.', 'Location unavailable; Lisbon was filled as an example. Confirm pickup.') : say('Origem sugerida · confirme antes de continuar.', 'Suggested pickup · confirm before continuing.')}</p><label>{say('Rota de referência', 'Reference route')}<select aria-label={say('Rota de referência', 'Reference route')} value={route} onChange={event => { const next = Number(event.target.value); setCustomRoute(null); setRoute(next); setOrigin(transferRoutes[next].points[0].label); setDestination(transferRoutes[next].points[transferRoutes[next].points.length - 1].label); }}>{transferRoutes.map((item, index) => <option value={index} key={item.name}>{item.name}</option>)}</select></label><RouteMap route={previewRoute} language={i18n.language === 'en' ? 'en' : 'pt'}/><div className="pm-route-metrics"><div><span>{say('Distância', 'Distance')}</span><strong>{km} km</strong></div><div><span>{say('Duração estimada', 'Estimated duration')}</span><strong>{baseRoute.minutes} min</strong></div><div><span>{say('A partir de', 'From')}</span><strong>{money(price.totalCents)}</strong></div></div><label>{say('Serviço', 'Service')}<select aria-label={say('Serviço', 'Service')} value={service} onChange={event => selectService(event.target.value as ServiceKind)}><option value="transfer">Transfer</option><option value="tour">Tour · Sintra / Cabo da Roca</option></select></label><label>{say('Data e hora de recolha', 'Pickup date and time')}<input type="datetime-local" required value={start} onChange={event => setStart(event.target.value)}/></label><div className="pm-route-options"><label>{say('Passageiros', 'Passengers')}<select aria-label={say('Passageiros', 'Passengers')} value={people} onChange={event => setPeople(Number(event.target.value))}>{Array.from({ length: Math.max(...cars.map(item => item.capacity)) }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select></label><label>{say('Espera adicional', 'Additional waiting')}<select aria-label={say('Espera adicional', 'Additional waiting')} value={wait} onChange={event => setWait(Number(event.target.value))}>{[0, 15, 30, 60].map(value => <option key={value} value={value}>{value} min</option>)}</select></label></div><p className="pm-field-help">{service === 'tour' ? say('Tour de 2 dias: preço de pacote para até 2 pessoas; adicionais aparecem no total.', '2-day tour: package price for up to 2 people; extras appear in the total.') : say('A estimativa usa a tarifa de demonstração configurável pelo proprietário. A rota real será validada no servidor.', 'The estimate uses the owner-configured demo tariff. The real route will be validated server-side.')}</p></section>}
        {step === 2 && <section className="pm-selection-step"><h2>{say('Escolha o motorista e o carro', 'Choose your driver and vehicle')}</h2><p className="pm-secondary">{say(`${km} km · ${baseRoute.minutes} min · ${people} passageiros`, `${km} km · ${baseRoute.minutes} min · ${people} passengers`)}</p><RouteMap route={previewRoute} language={i18n.language === 'en' ? 'en' : 'pt'}/><div className="pm-demo-grid">{drivers.map((driverName, index) => <button className="pm-card pm-demo-record pm-driver-choice" type="button" key={driverName} aria-pressed={driver === index} onClick={() => { setDriver(index); const nextCar = cars.findIndex(item => item.driver === index); setCar(nextCar); }}><img src="/driver-illustration.png" alt="" className="pm-option-art" /><span className="pm-option-content"><strong><UserRound size={17} aria-hidden="true" />{driverName}</strong><small>{say('Português / Inglês · Perfil de demonstração', 'Portuguese / English · Demo profile')}</small>{driver === index && <span className="pm-option-selected"><Check size={15} aria-hidden="true" />{say('Selecionado', 'Selected')}</span>}</span></button>)}</div><label className="pm-select-with-icon"><span><CarFront size={17} aria-hidden="true" />{say('Carro disponível', 'Available vehicle')}</span><select aria-label={say('Carro', 'Car')} value={car} onChange={event => setCar(Number(event.target.value))}>{cars.map((item, index) => item.driver === driver && <option value={index} key={item.name}>{item.name} · {item.capacity} {say('lugares', 'seats')}</option>)}</select></label><img className="pm-vehicle-preview" src={cars[car].capacity > 4 ? '/vehicle-van.png' : '/vehicle-sedan.png'} alt={say('Imagem ilustrativa do carro escolhido', 'Illustration of the selected vehicle')} />{people > cars[car].capacity && <p className="pm-error" role="alert">{say(`Este carro aceita até ${cars[car].capacity} passageiros.`, `This vehicle accepts up to ${cars[car].capacity} passengers.`)}</p>}<div className="pm-summary"><Row label={say('Estimativa da viagem', 'Trip estimate')} value={money(price.totalCents)}/><Row label={say('Distância', 'Distance')} value={`${km} km × 2,00 €`}/><Row label={say('Sinal · 25%', 'Deposit · 25%')} value={money(price.depositCents)}/><Row label={say('Saldo · 75%', 'Balance · 75%')} value={money(price.balanceCents)}/></div></section>}
        {step === 3 && <section><h2>{say('Os seus dados', 'Your details')}</h2><label>{say('Nome completo', 'Full name')}<input required maxLength={120} value={name} onChange={event => setName(event.target.value)}/></label><label>Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)}/></label><label>{say('Telefone', 'Phone')}<input required type="tel" value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel"/></label><label>NIF<input required inputMode="numeric" pattern="[0-9]{9}" maxLength={9} value={nif} onChange={event => setNif(event.target.value.replace(/\D/g, '').slice(0, 9))}/></label><p className="pm-field-help">{say('O NIF será usado apenas para faturação na versão real. Use dados fictícios neste teste.', 'The tax ID will only be used for invoicing in the live version. Use fictional details in this test.')}</p></section>}
        {step === 4 && <section><h2>{say('Rever pedido', 'Review request')}</h2><RouteMap route={previewRoute} language={i18n.language === 'en' ? 'en' : 'pt'}/><div className="pm-review-grid"><Row label={say('Percurso', 'Route')} value={routeSummary(origin, destination, stops)}/><Row label={say('Data e hora', 'Date and time')} value={start.replace('T', ' ')}/><Row label={say('Motorista', 'Driver')} value={drivers[driver]}/><Row label={say('Carro', 'Vehicle')} value={cars[car].name}/><Row label={say('Passageiros', 'Passengers')} value={people}/><Row label={say('Base', 'Base')} value={money(line('base'))}/><Row label={service === 'tour' ? say('Pessoas adicionais', 'Additional people') : say('Distância', 'Distance')} value={money(line(service === 'tour' ? 'extra_passengers' : 'distance'))}/><Row label={say('Espera', 'Waiting')} value={money(line('extra:waiting'))}/><Row label={say('Total', 'Total')} value={money(price.totalCents)}/></div><p>{say('Este pedido aguarda a aceitação do motorista antes do pagamento do sinal.', 'This request waits for driver acceptance before the deposit is paid.')}</p></section>}
        {error && <p role="alert">{error}</p>}<div className="pm-actions">{step > 1 && <Button type="button" variant="secondary" onClick={() => { setStep(step - 1); setError(''); }}><ArrowLeft size={17} aria-hidden="true" />{say('Voltar', 'Back')}</Button>}<Button type="submit">{step === 4 ? <><Send size={17} aria-hidden="true" />{say('Enviar pedido de teste', 'Submit test request')}</> : <><Check size={17} aria-hidden="true" />{say('Continuar', 'Continue')}</>}</Button></div>
      </form>
      {step > 1 && <div className="pm-summary"><Row label={say('Total estimado', 'Estimated total')} value={money(price.totalCents)}/><Row label={say('Sinal · 25%', 'Deposit · 25%')} value={money(price.depositCents)}/><Row label={say('Saldo · 75%', 'Balance · 75%')} value={money(price.balanceCents)}/></div>}
    </>}
  </>;
}
