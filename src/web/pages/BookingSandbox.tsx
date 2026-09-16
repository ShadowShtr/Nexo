import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { Ban, MapPin, Plus, Route, Save, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { checkSchedule, type Allocation } from '../../domain/calendar';
import { quote } from '../../domain/pricing';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';
import { RouteMap } from '../components/RouteMap';
import { tourRoute, transferRoutes, type DemoRoute } from '../demo-routes';
import { demoTrips } from './DemoPage';
import { readDemoCustomerRequests, subscribeToDemoCustomerRequests, type DemoCustomerRequest } from '../demo-request-store';

const zone = 'Europe/Lisbon';
const clock = '2026-09-10T00:00:00Z';
const drivers = ['Miguel Costa', 'Sofia Martins', 'André Ribeiro'];
const cars = [
  { name: 'Mercedes-Benz Classe E', driver: 0, capacity: 4 },
  { name: 'Mercedes-Benz Classe V', driver: 0, capacity: 6 },
  { name: 'BMW Série 5', driver: 1, capacity: 4 },
  { name: 'Volvo XC90', driver: 2, capacity: 6 },
];
type ServiceKind = 'transfer' | 'tour';
type ManualBooking = { id: string; allocation: Allocation; customer: string; service: ServiceKind; route: string; from: string; to: string; stops: string[]; total: number; deposit: number; balance: number; cancelled: boolean };

const seed: ManualBooking[] = demoTrips.slice(0, 3).map(trip => ({
  id: trip.id,
  allocation: { id: trip.id, driverId: String(trip.driver), vehicleId: String(trip.car), startsAt: `${trip.day}T${trip.time}:00+01:00`, endsAt: `${trip.day}T${trip.end}:00+01:00`, status: 'confirmed' },
  customer: trip.customer ? ['Ana Exemplo', 'Daniel Exemplo', 'Emma Example'][trip.customer] : 'Cliente',
  service: 'transfer', route: trip.to, from: trip.from, to: trip.to, stops: [], total: trip.cents, deposit: Math.round(trip.cents * .25), balance: trip.cents - Math.round(trip.cents * .25), cancelled: false,
}));

function routeSummary(origin: string, destination: string, stops: readonly string[]) {
  return [origin, ...stops, destination].filter(place => place.trim()).join(' → ');
}

function labelledRoute(route: DemoRoute, origin: string, destination: string, stops: readonly string[]): DemoRoute {
  const first = route.points[0];
  const last = route.points[route.points.length - 1];
  const middle = stops.map((label, index) => ({
    label,
    coordinates: route.shape[Math.min(index + 1, Math.max(0, route.shape.length - 2))] ?? first.coordinates,
    kind: 'stop' as const,
  }));
  return {
    ...route,
    name: routeSummary(origin, destination, stops),
    points: [{ ...first, label: origin, kind: 'pickup' }, ...middle, { ...last, label: destination, kind: 'destination' }],
  };
}

export function BookingSandbox() {
  const { i18n } = useTranslation();
  const en = i18n.language === 'en';
  const say = (pt: string, english: string) => en ? english : pt;
  const money = (cents: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const [rows, setRows] = useState(seed);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState<ServiceKind>('transfer');
  const [driver, setDriver] = useState(0);
  const [car, setCar] = useState(0);
  const [route, setRoute] = useState(0);
  const [origin, setOrigin] = useState(transferRoutes[0].points[0].label);
  const [destination, setDestination] = useState(transferRoutes[0].points.at(-1)?.label ?? 'Cascais');
  const [stops, setStops] = useState<string[]>([]);
  const [stopDraft, setStopDraft] = useState('');
  const [locationState, setLocationState] = useState<'suggested' | 'requesting' | 'fallback'>('suggested');
  const [start, setStart] = useState('2026-09-14T10:00');
  const [people, setPeople] = useState(2);
  const [incoming, setIncoming] = useState<DemoCustomerRequest[]>(() => readDemoCustomerRequests());
  useEffect(() => { const refresh = () => setIncoming(readDemoCustomerRequests()); return subscribeToDemoCustomerRequests(refresh); }, []);

  const baseRoute = service === 'tour' ? tourRoute : transferRoutes[route];
  const previewRoute = labelledRoute(baseRoute, origin || baseRoute.points[0].label, destination || baseRoute.points[baseRoute.points.length - 1].label, stops);
  const km = new Intl.NumberFormat(en ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(baseRoute.meters / 1000);
  const price = quote({ passengers: people, passengerCapacity: cars[car].capacity, service: { kind: 'transfer', baseCents: 1000, distanceMeters: baseRoute.meters, centsPerKm: 200 } });

  const chooseService = (value: ServiceKind) => {
    setService(value); setError('');
    if (value === 'tour') { setOrigin('Lisboa'); setDestination('Cabo da Roca'); setStops(['Sintra']); }
    else { setOrigin(transferRoutes[route].points[0].label); setDestination(transferRoutes[route].points.at(-1)?.label ?? 'Cascais'); setStops([]); }
  };
  const chooseReferenceRoute = (next: number) => {
    setRoute(next); setService('transfer'); setOrigin(transferRoutes[next].points[0].label); setDestination(transferRoutes[next].points.at(-1)?.label ?? ''); setStops([]); setError('');
  };
  const useLocation = () => {
    setLocationState('requesting');
    if (!navigator.geolocation) { setOrigin('Lisboa'); setLocationState('fallback'); return; }
    navigator.geolocation.getCurrentPosition(() => { setOrigin('Localização atual (teste)'); setLocationState('suggested'); }, () => { setOrigin('Lisboa'); setLocationState('fallback'); }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 });
  };
  const addStop = () => { const value = stopDraft.trim(); if (!value || stops.includes(value)) return; setStops(current => [...current, value]); setStopDraft(''); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const date = DateTime.fromISO(start, { zone });
    if (!customer.trim() || !origin.trim() || !destination.trim() || !date.isValid || date.getPossibleOffsets().length !== 1) { setError(say('Preencha cliente, percurso e uma hora de Lisboa válida.', 'Enter customer, route and a valid Lisbon time.')); return; }
    if (people > cars[car].capacity) { setError(say('O carro escolhido não tem capacidade para todos os passageiros.', 'The selected vehicle cannot carry all passengers.')); return; }
    const allocation: Allocation = { id: `MAN-${crypto.randomUUID().slice(0, 8)}`, driverId: String(driver), vehicleId: String(car), startsAt: date.toUTC().toISO()!, endsAt: date.plus({ minutes: baseRoute.minutes }).toUTC().toISO()!, status: 'requested', holdExpiresAt: DateTime.fromISO(clock).plus({ minutes: 30 }).toISO()! };
    const availability = checkSchedule(allocation, rows.map(row => row.allocation), clock, { minimumGapMinutes: 60, delayAllowanceMinutes: 15 }, () => 30);
    if (!availability.available) { setError(say('Horário indisponível para o motorista ou carro escolhido.', 'The selected driver or vehicle is unavailable at this time.')); return; }
    const priced = quote({ passengers: people, passengerCapacity: cars[car].capacity, service: { kind: 'transfer', baseCents: 1000, distanceMeters: baseRoute.meters, centsPerKm: 200 } });
    setRows(current => [...current, { id: allocation.id, allocation, customer: customer.trim(), service, route: previewRoute.name, from: origin.trim(), to: destination.trim(), stops: [...stops], total: priced.totalCents, deposit: priced.depositCents, balance: priced.balanceCents, cancelled: false }]);
    setShowForm(false); setFeedback(say('Marcação manual criada em modo de teste.', 'Manual booking created in test mode.'));
  };
  const cancel = (id: string) => { setRows(current => current.map(row => row.id === id ? { ...row, cancelled: true, allocation: { ...row.allocation, status: 'cancelled' } } : row)); setFeedback(say('Marcação de teste cancelada.', 'Test booking cancelled.')); };

  return <>
    <div className="pm-owner-bookings-intro"><div><span className="pm-eyebrow">{say('Operação do proprietário', 'Owner operation')}</span><h2>{say('Criar uma marcação', 'Create a booking')}</h2><p>{say('Registe uma viagem recebida por telefone ou WhatsApp com o percurso completo.', 'Record a trip received by phone or WhatsApp with the complete route.')}</p></div><Button onClick={() => { setShowForm(value => !value); setError(''); }}>{showForm ? <><X size={17} aria-hidden="true" />{say('Fechar formulário', 'Close form')}</> : <><Plus size={17} aria-hidden="true" />{say('Nova marcação manual', 'New manual booking')}</>}</Button></div>
    {showForm && <form className="pm-card pm-form pm-owner-manual-form" aria-label={say('Marcação manual', 'Manual booking')} onSubmit={submit}>
      <div className="pm-owner-form-heading"><div><span className="pm-eyebrow">{say('Nova reserva', 'New booking')}</span><h2>{say('Percurso e detalhes', 'Route and details')}</h2><p>{say('Preencha a localização, paragens e horário antes de escolher os recursos.', 'Enter locations, stops and time before choosing resources.')}</p></div><span className="pm-owner-form-icon"><Route size={22} /></span></div>
      <label>{say('Cliente', 'Customer')}<input name="customer" required maxLength={120} value={customer} onChange={event => setCustomer(event.target.value)} placeholder={say('Nome completo', 'Full name')} /></label>
      <div className="pm-owner-route-fields"><label>{say('Local de partida', 'Pickup')}<input list="pm-owner-origin-options" value={origin} onChange={event => setOrigin(event.target.value)} required /><datalist id="pm-owner-origin-options"><option value="Aeroporto de Lisboa" /><option value="Lisboa" /><option value="Cascais" /><option value="Sintra" /></datalist></label><button type="button" className="pm-owner-location-action" onClick={useLocation}><MapPin size={17} />{locationState === 'requesting' ? say('A localizar…', 'Locating…') : say('Usar localização atual', 'Use current location')}</button><p className="pm-field-help">{locationState === 'fallback' ? say('Localização indisponível; Lisboa foi preenchida como exemplo. Confirme a origem.', 'Location unavailable; Lisbon was filled as an example. Confirm pickup.') : say('A origem pode ser editada ou preenchida pela localização atual.', 'Pickup can be edited or filled from the current location.')}</p><label>{say('Destino', 'Destination')}<input list="pm-owner-destination-options" value={destination} onChange={event => setDestination(event.target.value)} required placeholder={say('Ex.: Cascais', 'e.g. Cascais')} /><datalist id="pm-owner-destination-options"><option value="Cascais" /><option value="Sintra" /><option value="Setúbal" /><option value="Cabo da Roca" /></datalist></label><label>{say('Paragem', 'Stop')}<div className="pm-owner-stop-input"><input value={stopDraft} onChange={event => setStopDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addStop(); } }} placeholder={say('Adicionar paragem', 'Add stop')} /><button type="button" aria-label={say('Adicionar paragem', 'Add stop')} onClick={addStop}><Plus size={17} /></button></div></label>{stops.length > 0 && <ul className="pm-owner-stop-list">{stops.map(stop => <li key={stop}><span>{stop}</span><button type="button" aria-label={`${say('Remover paragem', 'Remove stop')} ${stop}`} onClick={() => setStops(current => current.filter(item => item !== stop))}><Trash2 size={15} /></button></li>)}</ul>}</div>
      <label>{say('Rota de referência', 'Reference route')}<select aria-label={say('Rota de referência', 'Reference route')} value={service === 'tour' ? 'tour' : route} onChange={event => event.target.value === 'tour' ? chooseService('tour') : chooseReferenceRoute(Number(event.target.value))}><option value="tour">{say('Tour · Lisboa → Sintra → Cabo da Roca', 'Tour · Lisbon → Sintra → Cabo da Roca')}</option>{transferRoutes.map((item, index) => <option value={index} key={item.name}>{item.name}</option>)}</select></label>
      <RouteMap route={previewRoute} language={en ? 'en' : 'pt'} />
      <div className="pm-route-metrics"><div><span>{say('Distância', 'Distance')}</span><strong>{km} km</strong></div><div><span>{say('Duração estimada', 'Estimated duration')}</span><strong>{baseRoute.minutes} min</strong></div><div><span>{say('Estimativa', 'Estimate')}</span><strong>{money(price.totalCents)}</strong></div></div>
      <div className="pm-owner-form-grid"><label>{say('Serviço', 'Service')}<select value={service} onChange={event => chooseService(event.target.value as ServiceKind)}><option value="transfer">Transfer</option><option value="tour">Tour · Sintra / Cabo da Roca</option></select></label><label>{say('Data e hora', 'Date and time')}<input type="datetime-local" required value={start} onChange={event => setStart(event.target.value)} /></label><label>{say('Passageiros', 'Passengers')}<select value={people} onChange={event => setPeople(Number(event.target.value))}>{Array.from({ length: Math.max(...cars.map(item => item.capacity)) }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select></label><label>{say('Motorista', 'Driver')}<select value={driver} onChange={event => { const next = Number(event.target.value); setDriver(next); setCar(cars.findIndex(item => item.driver === next)); }}>{drivers.map((name, index) => <option value={index} key={name}>{name}</option>)}</select></label><label>{say('Carro', 'Vehicle')}<select value={car} onChange={event => setCar(Number(event.target.value))}>{cars.map((item, index) => item.driver === driver && <option value={index} key={item.name}>{item.name} · {item.capacity} {say('lugares', 'seats')}</option>)}</select></label></div>
      <p className="pm-field-help">{say('A rota é ilustrativa no modo demo. A disponibilidade do motorista e do carro respeita o calendário e a margem de 1 hora.', 'The route is illustrative in demo mode. Driver and vehicle availability follows the calendar and the 1-hour buffer.')}</p>
      {error && <p role="alert">{error}</p>}<div className="pm-actions"><Button type="submit"><Save size={17} aria-hidden="true" />{say('Guardar marcação', 'Save booking')}</Button></div>
    </form>}
    {feedback && <p role="status">{feedback}</p>}
    <Section title={say('Pedidos recebidos do site', 'Requests received from website')}><p className="pm-secondary">{say('Os pedidos enviados no fluxo do cliente aparecem aqui com os dados necessários para contacto, confirmação e execução. Demonstração sincronizada neste navegador.', 'Requests submitted in the customer flow appear here with the details needed for contact, confirmation and fulfilment. Demo syncs in this browser.')}</p>{incoming.length ? <div className="pm-demo-grid">{incoming.map(request => <article className="pm-card pm-demo-record pm-owner-request" key={request.id}><div className="pm-section-heading"><img className="pm-demo-icon-art" src="/owner-icon-calendar.png" alt="" aria-hidden="true" /><span className="pm-status" data-tone={request.cancelled ? 'neutral' : 'positive'}>{request.cancelled ? say('CANCELADO', 'CANCELLED') : say('NOVO PEDIDO', 'NEW REQUEST')}</span><span className="pm-secondary">{request.id}</span></div><h2>{request.name}</h2><p>{routeSummary(request.origin, request.destination, request.stops)}</p><p className="pm-secondary">{DateTime.fromISO(request.allocation.startsAt).setZone(zone).toFormat('dd/MM/yyyy HH:mm')} · {drivers[request.driver] ?? '—'} · {cars[request.car]?.name ?? '—'}</p><Row label={say('Contacto', 'Contact')} value={`${request.email} · ${request.phone}`} /><Row label="NIF" value={request.nif} /><Row label={say('Passageiros', 'Passengers')} value={request.people} /><Row label={say('Total', 'Total')} value={money(request.total)} /><Row label={say('Sinal · 25%', 'Deposit · 25%')} value={money(request.deposit)} /><Row label={say('Saldo · 75%', 'Balance · 75%')} value={money(request.balance)} /></article>)}</div> : <p>{say('Ainda não há pedidos enviados pelo cliente.', 'No customer requests have been submitted yet.')}</p>}</Section>
    <Section title={say('Marcações registadas', 'Recorded bookings')}><div className="pm-demo-grid">{rows.map(row => <article className="pm-card pm-demo-record" key={row.id}><div className="pm-section-heading"><img className="pm-demo-icon-art" src="/owner-icon-calendar.png" alt="" aria-hidden="true" /><span className="pm-status" data-tone={row.cancelled ? 'neutral' : 'positive'}>{row.cancelled ? say('CANCELADA', 'CANCELLED') : say('PEDIDO', 'REQUEST')}</span><span className="pm-secondary">{row.id}</span></div><h2>{row.customer}</h2><p>{routeSummary(row.from, row.to, row.stops)}</p><p className="pm-secondary">{DateTime.fromISO(row.allocation.startsAt).setZone(zone).toFormat('dd/MM/yyyy HH:mm')} · {drivers[Number(row.allocation.driverId)]} · {cars[Number(row.allocation.vehicleId)].name}</p><Row label={say('Origem', 'Source')} value={say('WhatsApp / telefone', 'WhatsApp / phone')} /><Row label={say('Total', 'Total')} value={money(row.total)} /><Row label={say('Sinal · 25%', 'Deposit · 25%')} value={money(row.deposit)} /><Row label={say('Saldo', 'Balance')} value={money(row.balance)} />{!row.cancelled && <Button variant="secondary" onClick={() => cancel(row.id)}><Ban size={17} aria-hidden="true" />{say('Cancelar teste', 'Cancel test')}</Button>}</article>)}</div></Section>
  </>;
}
