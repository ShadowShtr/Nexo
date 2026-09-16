import { useEffect, useMemo, useState } from 'react';
import { Ban, CalendarCheck2, MapPin, Plus, Route, Save, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { checkSchedule, type Allocation } from '../../domain/calendar';
import { quote } from '../../domain/pricing';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';
import { RouteMap } from '../components/RouteMap';
import { searchAddresses, type AddressSearchResult } from '../services/address-search';
import { customerCalendarChangedEvent, isCustomerSlotAvailable, ownerCalendarZone, readOwnerCalendar, saveOwnerCalendarBookings } from '../customer-availability';
import { tourRoute, transferRoutes, type DemoRoute } from '../demo-routes';
import { demoTrips } from './DemoPage';
import { readDemoTariff, subscribeToDemoTariff } from '../demo-config';
import { readDemoCustomerRequests, subscribeToDemoCustomerRequests, type DemoCustomerRequest } from '../demo-request-store';

const zone = ownerCalendarZone;
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
type RegisteredTour = { id: string; namePt: string; nameEn: string; area: string; baseCents: number; extraPassengerCents: number; active: boolean };

const seed: ManualBooking[] = demoTrips.slice(0, 3).map(trip => ({
  id: trip.id,
  allocation: { id: trip.id, driverId: String(trip.driver), vehicleId: String(trip.car), startsAt: `${trip.day}T${trip.time}:00+01:00`, endsAt: `${trip.day}T${trip.end}:00+01:00`, status: 'confirmed' },
  customer: trip.customer ? ['Ana Exemplo', 'Daniel Exemplo', 'Emma Example'][trip.customer] : 'Cliente',
  service: 'transfer', route: trip.to, from: trip.from, to: trip.to, stops: [], total: trip.cents, deposit: Math.round(trip.cents * .25), balance: trip.cents - Math.round(trip.cents * .25), cancelled: false,
}));

const defaultTours: readonly RegisteredTour[] = [
  { id: 't1', namePt: 'Sintra e Cabo da Roca', nameEn: 'Sintra and Cabo da Roca', area: 'Sintra', baseCents: 20000, extraPassengerCents: 3500, active: true },
  { id: 't2', namePt: 'Douro Premium', nameEn: 'Premium Douro', area: 'Douro', baseCents: 32000, extraPassengerCents: 4500, active: true },
];

const localPlaces: readonly AddressSearchResult[] = [
  { title: 'Lisboa', detail: 'Lisboa, Portugal', coordinates: [38.7223, -9.1393], source: 'photon' },
  { title: 'Sintra', detail: 'Sintra, Lisboa', coordinates: [38.8029, -9.3817], source: 'photon' },
  { title: 'Cascais', detail: 'Cascais, Lisboa', coordinates: [38.6979, -9.4215], source: 'photon' },
  { title: 'Setúbal', detail: 'Setúbal, Portugal', coordinates: [38.5244, -8.8882], source: 'photon' },
  { title: 'Porto', detail: 'Porto, Portugal', coordinates: [41.1496, -8.6109], source: 'photon' },
  { title: 'Douro', detail: 'Douro, Portugal', coordinates: [41.1702, -7.7909], source: 'photon' },
  { title: 'Aeroporto de Lisboa', detail: 'Alameda das Comunidades Portuguesas', coordinates: [38.7742, -9.1342], source: 'photon' },
  { title: 'Cabo da Roca', detail: 'Estrada do Cabo da Roca, Sintra', coordinates: [38.7804, -9.4989], source: 'photon' },
  { title: 'Quinta da Regaleira', detail: 'Rua Barbosa du Bocage, Sintra', coordinates: [38.7967, -9.3977], source: 'photon' },
  { title: 'Palácio Nacional da Pena', detail: 'Estrada da Pena, Sintra', coordinates: [38.7876, -9.3906], source: 'photon' },
  { title: 'Praça do Comércio', detail: 'Baixa, Lisboa', coordinates: [38.7079, -9.1366], source: 'photon' },
  { title: 'Parque das Nações', detail: 'Lisboa', coordinates: [38.7675, -9.0953], source: 'photon' },
];

function normalizePlace(value: string) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function readTours(): RegisteredTour[] {
  try {
    const raw = window.localStorage.getItem('pm.demo.tours');
    if (!raw) return [...defaultTours];
    const parsed = JSON.parse(raw) as RegisteredTour[];
    return Array.isArray(parsed) && parsed.length ? parsed.filter(tour => typeof tour.id === 'string' && typeof tour.namePt === 'string' && typeof tour.area === 'string' && tour.active !== false) : [...defaultTours];
  } catch { return [...defaultTours]; }
}

function routeSummary(origin: string, destination: string, stops: readonly string[]) {
  return [origin, ...stops, destination].filter(place => place.trim()).join(' → ');
}

function distanceMeters(from: readonly [number, number], to: readonly [number, number]) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadius = 6_371_000;
  const latitudeDelta = radians(to[0] - from[0]);
  const longitudeDelta = radians(to[1] - from[1]);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(a)) * 1.2);
}

function dynamicRoute(origin: string, destination: string, stops: readonly string[], resolved: Readonly<Record<string, AddressSearchResult>>, fallback: DemoRoute): DemoRoute {
  const labels = [origin || fallback.points[0].label, ...stops.filter(stop => stop.trim()), destination || fallback.points[fallback.points.length - 1].label];
  const coordinates = labels.map(label => resolved[normalizePlace(label)]?.coordinates ?? localPlaces.find(place => normalizePlace(place.title) === normalizePlace(label))?.coordinates);
  if (coordinates.some(point => !point)) {
    const first = fallback.points[0];
    const last = fallback.points[fallback.points.length - 1];
    return { ...fallback, name: routeSummary(labels[0], labels[labels.length - 1], labels.slice(1, -1)), points: [{ ...first, label: labels[0], kind: 'pickup' }, ...labels.slice(1, -1).map((label, index) => ({ label, coordinates: fallback.shape[Math.min(index + 1, Math.max(0, fallback.shape.length - 2))] ?? first.coordinates, kind: 'stop' as const })), { ...last, label: labels[labels.length - 1], kind: 'destination' }] };
  }
  const completeCoordinates = coordinates as readonly (readonly [number, number])[];
  const shape: Array<readonly [number, number]> = [completeCoordinates[0]!];
  let meters = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const from = completeCoordinates[index - 1]!;
    const to = completeCoordinates[index]!;
    meters += distanceMeters(from, to);
    shape.push([from[0] + (to[0] - from[0]) * .33, from[1] + (to[1] - from[1]) * .28], [from[0] + (to[0] - from[0]) * .68, from[1] + (to[1] - from[1]) * .78], to);
  }
  return { name: labels.join(' → '), meters, minutes: Math.max(10, Math.round(meters / 1000 / 55 * 60)), points: labels.map((label, index) => ({ label, coordinates: completeCoordinates[index]!, kind: index === 0 ? 'pickup' : index === labels.length - 1 ? 'destination' : 'stop' } as const)), shape };
}

type AddressFieldProps = { label: string; value: string; placeholder: string; language: 'pt' | 'en'; required?: boolean; onChange: (value: string) => void; onSelect: (place: AddressSearchResult) => void };
function AddressField({ label, value, placeholder, language, required = true, onChange, onSelect }: AddressFieldProps) {
  const [focused, setFocused] = useState(false);
  const [remote, setRemote] = useState<AddressSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const local = useMemo(() => localPlaces.filter(place => `${place.title} ${place.detail}`.toLocaleLowerCase().includes(value.toLocaleLowerCase().trim())).slice(0, 5), [value]);
  useEffect(() => {
    const query = value.trim();
    if (!focused || query.length < 3) { setRemote([]); setLoading(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchAddresses({ queries: [query], language, signal: controller.signal, geoapifyKey: import.meta.env.VITE_GEOAPIFY_API_KEY?.trim(), geoapifyUrl: import.meta.env.VITE_GEOAPIFY_URL?.trim() || undefined, photonUrl: import.meta.env.VITE_PHOTON_URL?.trim() || undefined });
        if (!controller.signal.aborted) setRemote(results);
      } catch (error) {
        if ((error as { name?: string }).name !== 'AbortError') setRemote([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [focused, language, value]);
  const suggestions = [...local, ...remote.filter(remotePlace => !local.some(localPlace => normalizePlace(localPlace.title) === normalizePlace(remotePlace.title)))].slice(0, 7);
  return <div className="pm-owner-address-field"><label>{label}<input value={value} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 120)} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" required={required} /></label>{focused && value.trim().length >= 3 && <div className="pm-owner-address-suggestions" role="listbox" aria-label={language === 'en' ? 'Address suggestions' : 'Sugestões de morada'}>{suggestions.length ? suggestions.map(place => <button type="button" role="option" key={`${place.title}-${place.detail}`} onMouseDown={event => event.preventDefault()} onClick={() => { onSelect(place); setFocused(false); }}><MapPin size={16} /><span><strong>{place.title}</strong><small>{place.detail}</small></span></button>) : <p>{loading ? (language === 'en' ? 'Searching addresses…' : 'A procurar moradas…') : (language === 'en' ? 'No address found. Try another search.' : 'Nenhuma morada encontrada. Tente outra pesquisa.')}</p>}</div>}</div>;
}

export function BookingSandbox() {
  const { i18n } = useTranslation();
  const en = i18n.language === 'en';
  const language = en ? 'en' : 'pt';
  const say = (pt: string, english: string) => en ? english : pt;
  const money = (cents: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const [rows, setRows] = useState(seed);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState<ServiceKind>('transfer');
  const [tours, setTours] = useState<RegisteredTour[]>(readTours);
  const [selectedTourId, setSelectedTourId] = useState(defaultTours[0].id);
  const [driver, setDriver] = useState(0);
  const [car, setCar] = useState(0);
  const [route, setRoute] = useState(0);
  const [origin, setOrigin] = useState(transferRoutes[0].points[0].label);
  const [destination, setDestination] = useState(transferRoutes[0].points.at(-1)?.label ?? 'Cascais');
  const [stops, setStops] = useState<string[]>([]);
  const [stopDraft, setStopDraft] = useState('');
  const [resolvedPlaces, setResolvedPlaces] = useState<Record<string, AddressSearchResult>>({});
  const [locationState, setLocationState] = useState<'suggested' | 'requesting' | 'fallback'>('suggested');
  const [start, setStart] = useState('2026-09-14T10:00');
  const [people, setPeople] = useState(2);
  const [tariff, setTariff] = useState(readDemoTariff);
  const [calendarVersion, setCalendarVersion] = useState(0);
  const [incoming, setIncoming] = useState<DemoCustomerRequest[]>(() => readDemoCustomerRequests());
  useEffect(() => { const refresh = () => setIncoming(readDemoCustomerRequests()); return subscribeToDemoCustomerRequests(refresh); }, []);
  useEffect(() => subscribeToDemoTariff(() => setTariff(readDemoTariff())), []);
  useEffect(() => {
    const refresh = () => setCalendarVersion(version => version + 1);
    window.addEventListener('storage', refresh);
    window.addEventListener(customerCalendarChangedEvent, refresh);
    const onStorage = () => setTours(readTours());
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener(customerCalendarChangedEvent, refresh); window.removeEventListener('storage', onStorage); };
  }, []);

  const activeTours = tours.length ? tours : [...defaultTours];
  const selectedTour = activeTours.find(tour => tour.id === selectedTourId) ?? activeTours[0];
  const baseTemplate = service === 'tour' ? tourRoute : transferRoutes[route];
  const previewRoute = dynamicRoute(origin, destination, stops, resolvedPlaces, baseTemplate);
  const durationMinutes = Math.max(60, previewRoute.minutes || baseTemplate.minutes);
  const km = new Intl.NumberFormat(en ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format((previewRoute.meters || baseTemplate.meters) / 1000);
  const price = quote({ passengers: people, passengerCapacity: cars[car].capacity, service: service === 'tour' ? { kind: 'tour', baseCents: selectedTour?.baseCents ?? tariff.tourBaseCents, extraPassengerCents: selectedTour?.extraPassengerCents ?? tariff.tourExtraPassengerCents } : { kind: 'transfer', baseCents: tariff.transferBaseCents, distanceMeters: previewRoute.meters || baseTemplate.meters, centsPerKm: tariff.transferCentsPerKm }, nightSurchargeBps: tariff.nightSurchargeBps });
  const ownerCalendar = useMemo(() => readOwnerCalendar(), [calendarVersion]);
  const agendaBookings = useMemo(() => {
    const byId = new Map<string, Allocation>();
    [...ownerCalendar.bookings, ...rows.map(row => row.allocation), ...incoming.filter(item => !item.cancelled).map(item => item.allocation)].forEach(booking => byId.set(booking.id, { ...booking, status: (booking.status ?? 'requested') as Allocation['status'] }));
    return [...byId.values()];
  }, [incoming, ownerCalendar, rows]);
  const selectedDate = DateTime.fromISO(start, { zone });
  const dateValid = selectedDate.isValid && selectedDate.toFormat("yyyy-MM-dd'T'HH:mm") === start && selectedDate.getPossibleOffsets().length === 1;
  const scheduleAvailable = dateValid && isCustomerSlotAvailable(selectedDate.toFormat('yyyy-MM-dd'), selectedDate.toFormat('HH:mm'), durationMinutes, agendaBookings, ownerCalendar.settings, [{ driverId: String(driver), vehicleId: String(car) }]);

  const rememberPlace = (place: AddressSearchResult) => setResolvedPlaces(current => ({ ...current, [normalizePlace(place.title)]: place }));
  const changeDestination = (value: string) => {
    setDestination(value); setError('');
    const match = transferRoutes.findIndex(item => item.points[item.points.length - 1].label.toLocaleLowerCase() === value.trim().toLocaleLowerCase());
    if (match >= 0) { setRoute(match); setService('transfer'); setStops([]); setOrigin(transferRoutes[match].points[0].label); }
  };
  const applyTour = (tour: RegisteredTour) => {
    const douro = normalizePlace(tour.area).includes('douro') || normalizePlace(tour.area).includes('porto');
    setOrigin('Lisboa'); setDestination(douro ? tour.area : 'Cabo da Roca'); setStops(douro ? ['Porto'] : ['Sintra']);
  };
  const chooseService = (value: string) => {
    if (value === 'transfer') { setService('transfer'); setOrigin(transferRoutes[route].points[0].label); setDestination(transferRoutes[route].points.at(-1)?.label ?? 'Cascais'); setStops([]); return; }
    const tour = activeTours.find(item => item.id === value.replace('tour:', '')) ?? activeTours[0];
    setService('tour'); setSelectedTourId(tour.id); applyTour(tour);
  };
  const useLocation = () => {
    setLocationState('requesting');
    if (!navigator.geolocation) { setOrigin('Lisboa'); setLocationState('fallback'); return; }
    navigator.geolocation.getCurrentPosition(() => { setOrigin('Lisboa'); setLocationState('suggested'); }, () => { setOrigin('Lisboa'); setLocationState('fallback'); }, { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 });
  };
  const addStop = () => { const value = stopDraft.trim(); if (!value || stops.includes(value)) return; setStops(current => [...current, value]); setStopDraft(''); };
  const rememberAndSetStop = (place: AddressSearchResult) => { rememberPlace(place); setStopDraft(place.title); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    if (!customer.trim() || !origin.trim() || !destination.trim() || !dateValid) { setError(say('Preencha cliente, percurso e uma hora de Lisboa válida.', 'Enter customer, route and a valid Lisbon time.')); return; }
    if (people > cars[car].capacity) { setError(say('O carro escolhido não tem capacidade para todos os passageiros.', 'The selected vehicle cannot carry all passengers.')); return; }
    if (!scheduleAvailable) { setError(say('Este horário está indisponível na agenda. Escolha outra data, hora ou recurso.', 'This time is unavailable in the calendar. Choose another date, time or resource.')); return; }
    const allocation: Allocation & { from: string; to: string; stops: string[] } = { id: `MAN-${crypto.randomUUID().slice(0, 8)}`, driverId: String(driver), vehicleId: String(car), startsAt: selectedDate.toUTC().toISO()!, endsAt: selectedDate.plus({ minutes: durationMinutes }).toUTC().toISO()!, status: 'requested', holdExpiresAt: DateTime.fromISO(clock).plus({ minutes: 30 }).toISO()!, from: origin.trim(), to: destination.trim(), stops: [...stops] };
    const availability = checkSchedule(allocation, agendaBookings, clock, { minimumGapMinutes: 60, delayAllowanceMinutes: 15 }, () => 30);
    if (!availability.available) { setError(say('Horário indisponível para o motorista ou carro escolhido.', 'The selected driver or vehicle is unavailable at this time.')); return; }
    const currentCalendar = readOwnerCalendar();
    saveOwnerCalendarBookings([...currentCalendar.bookings.filter(booking => booking.source !== 'customer' && booking.id !== allocation.id), allocation]);
    setRows(current => [...current, { id: allocation.id, allocation, customer: customer.trim(), service, route: previewRoute.name, from: origin.trim(), to: destination.trim(), stops: [...stops], total: price.totalCents, deposit: price.depositCents, balance: price.balanceCents, cancelled: false }]);
    setShowForm(false); setFeedback(say('Marcação manual criada e adicionada à agenda.', 'Manual booking created and added to the calendar.'));
  };
  const cancel = (id: string) => { setRows(current => current.map(row => row.id === id ? { ...row, cancelled: true, allocation: { ...row.allocation, status: 'cancelled' } } : row)); const currentCalendar = readOwnerCalendar(); saveOwnerCalendarBookings(currentCalendar.bookings.filter(booking => booking.source !== 'customer' && booking.id !== id)); setFeedback(say('Marcação de teste cancelada.', 'Test booking cancelled.')); };

  return <>
    <div className="pm-owner-bookings-intro"><div><span className="pm-eyebrow">{say('Operação do proprietário', 'Owner operation')}</span><h2>{say('Criar uma marcação', 'Create a booking')}</h2><p>{say('Registe uma viagem recebida por telefone ou WhatsApp com o percurso completo.', 'Record a trip received by phone or WhatsApp with the complete route.')}</p></div><Button onClick={() => { setShowForm(value => !value); setError(''); }}>{showForm ? <><X size={17} aria-hidden="true" />{say('Fechar formulário', 'Close form')}</> : <><Plus size={17} aria-hidden="true" />{say('Nova marcação manual', 'New manual booking')}</>}</Button></div>
    {showForm && <form className="pm-card pm-form pm-owner-manual-form" aria-label={say('Marcação manual', 'Manual booking')} onSubmit={submit}>
      <div className="pm-owner-form-heading"><div><span className="pm-eyebrow">{say('Nova reserva', 'New booking')}</span><h2>{say('Percurso e detalhes', 'Route and details')}</h2><p>{say('Preencha locais, paragens e horário. O horário é confirmado na agenda.', 'Enter locations, stops and time. The time is checked against the calendar.')}</p></div><span className="pm-owner-form-icon"><Route size={22} /></span></div>
      <label>{say('Cliente', 'Customer')}<input name="customer" required maxLength={120} value={customer} onChange={event => setCustomer(event.target.value)} placeholder={say('Nome completo', 'Full name')} /></label>
      <div className="pm-owner-route-fields"><AddressField label={say('Local de partida', 'Pickup')} value={origin} language={language} onChange={value => { setOrigin(value); setLocationState('suggested'); }} onSelect={place => { rememberPlace(place); setOrigin(place.title); setLocationState('suggested'); }} placeholder={say('Pesquisar morada ou local', 'Search address or place')} /><button type="button" className="pm-owner-location-action" onClick={useLocation}><MapPin size={17} />{locationState === 'requesting' ? say('A localizar…', 'Locating…') : say('Usar localização atual', 'Use current location')}</button><p className="pm-field-help">{locationState === 'fallback' ? say('Localização indisponível; Lisboa foi preenchida como exemplo. Confirme a origem.', 'Location unavailable; Lisbon was filled as an example. Confirm pickup.') : say('Pesquise uma morada nova ou use a localização atual.', 'Search for a new address or use the current location.')}</p><AddressField label={say('Destino', 'Destination')} value={destination} language={language} onChange={changeDestination} onSelect={place => { rememberPlace(place); changeDestination(place.title); }} placeholder={say('Pesquisar destino', 'Search destination')} /><label>{say('Paragem', 'Stop')}<div className="pm-owner-stop-input"><AddressField label="" value={stopDraft} language={language} required={false} onChange={setStopDraft} onSelect={rememberAndSetStop} placeholder={say('Pesquisar e adicionar paragem', 'Search and add a stop')} /><button type="button" aria-label={say('Adicionar paragem', 'Add stop')} onClick={addStop}><Plus size={17} /></button></div></label>{stops.length > 0 && <ul className="pm-owner-stop-list">{stops.map(stop => <li key={stop}><span>{stop}</span><button type="button" aria-label={`${say('Remover paragem', 'Remove stop')} ${stop}`} onClick={() => setStops(current => current.filter(item => item !== stop))}><Trash2 size={15} /></button></li>)}</ul>}</div>
      <RouteMap route={previewRoute} language={language} />
      <div className="pm-route-metrics"><div><span>{say('Distância', 'Distance')}</span><strong>{km} km</strong></div><div><span>{say('Duração estimada', 'Estimated duration')}</span><strong>{durationMinutes} min</strong></div><div><span>{say('Estimativa', 'Estimate')}</span><strong>{money(price.totalCents)}</strong></div></div>
      <div className="pm-owner-form-grid"><label>{say('Serviço', 'Service')}<select value={service === 'tour' ? `tour:${selectedTour?.id ?? selectedTourId}` : 'transfer'} onChange={event => chooseService(event.target.value)}><option value="transfer">Transfer</option>{activeTours.map(tour => <option value={`tour:${tour.id}`} key={tour.id}>{say(tour.namePt, tour.nameEn)} · {tour.area}</option>)}</select></label><label>{say('Data e hora', 'Date and time')}<input type="datetime-local" required value={start} onChange={event => setStart(event.target.value)} /></label><label>{say('Passageiros', 'Passengers')}<select value={people} onChange={event => setPeople(Number(event.target.value))}>{Array.from({ length: Math.max(...cars.map(item => item.capacity)) }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select></label><label>{say('Motorista', 'Driver')}<select value={driver} onChange={event => { const next = Number(event.target.value); setDriver(next); setCar(cars.findIndex(item => item.driver === next)); }}>{drivers.map((name, index) => <option value={index} key={name}>{name}</option>)}</select></label><label>{say('Carro', 'Vehicle')}<select value={car} onChange={event => setCar(Number(event.target.value))}>{cars.map((item, index) => item.driver === driver && <option value={index} key={item.name}>{item.name} · {item.capacity} {say('lugares', 'seats')}</option>)}</select></label></div>
      <div className={`pm-owner-calendar-status ${!dateValid ? 'is-invalid' : scheduleAvailable ? 'is-available' : 'is-unavailable'}`}><CalendarCheck2 size={18} /><span>{!dateValid ? say('Escolha uma data e hora válidas.', 'Choose a valid date and time.') : scheduleAvailable ? say('Horário disponível na agenda.', 'Time available in the calendar.') : say('Horário indisponível na agenda.', 'Time unavailable in the calendar.')}</span><a href="#/owner/calendar">{say('Abrir agenda', 'Open calendar')}</a></div>
      <p className="pm-field-help">{say('Tours publicados no catálogo aparecem no serviço. A marcação guardada bloqueia este motorista e carro na agenda, incluindo o intervalo de 1 hora.', 'Published tours appear in the service list. A saved booking blocks this driver and vehicle in the calendar, including the 1-hour buffer.')}</p>
      {error && <p role="alert">{error}</p>}<div className="pm-actions"><Button type="submit"><Save size={17} aria-hidden="true" />{say('Guardar marcação', 'Save booking')}</Button></div>
    </form>}
    {feedback && <p role="status">{feedback}</p>}
    <Section title={say('Pedidos recebidos do site', 'Requests received from website')}><p className="pm-secondary">{say('Os pedidos enviados no fluxo do cliente aparecem aqui com os dados necessários para contacto, confirmação e execução. Demonstração sincronizada neste navegador.', 'Requests submitted in the customer flow appear here with the details needed for contact, confirmation and fulfilment. Demo syncs in this browser.')}</p>{incoming.length ? <div className="pm-demo-grid">{incoming.map(request => <article className="pm-card pm-demo-record pm-owner-request" key={request.id}><div className="pm-section-heading"><img className="pm-demo-icon-art" src="/owner-icon-calendar.png" alt="" aria-hidden="true" /><span className="pm-status" data-tone={request.cancelled ? 'neutral' : 'positive'}>{request.cancelled ? say('CANCELADO', 'CANCELLED') : say('NOVO PEDIDO', 'NEW REQUEST')}</span><span className="pm-secondary">{request.id}</span></div><h2>{request.name}</h2><p>{routeSummary(request.origin, request.destination, request.stops)}</p><p className="pm-secondary">{DateTime.fromISO(request.allocation.startsAt).setZone(zone).toFormat('dd/MM/yyyy HH:mm')} · {drivers[request.driver] ?? '—'} · {cars[request.car]?.name ?? '—'}</p><Row label={say('Contacto', 'Contact')} value={`${request.email} · ${request.phone}`} /><Row label="NIF" value={request.nif} /><Row label={say('Passageiros', 'Passengers')} value={request.people} /><Row label={say('Total', 'Total')} value={money(request.total)} /><Row label={say('Sinal · 25%', 'Deposit · 25%')} value={money(request.deposit)} /><Row label={say('Saldo · 75%', 'Balance · 75%')} value={money(request.balance)} /></article>)}</div> : <p>{say('Ainda não há pedidos enviados pelo cliente.', 'No customer requests have been submitted yet.')}</p>}</Section>
    <Section title={say('Marcações registadas', 'Recorded bookings')}><div className="pm-demo-grid">{rows.map(row => <article className="pm-card pm-demo-record" key={row.id}><div className="pm-section-heading"><img className="pm-demo-icon-art" src="/owner-icon-calendar.png" alt="" aria-hidden="true" /><span className="pm-status" data-tone={row.cancelled ? 'neutral' : 'positive'}>{row.cancelled ? say('CANCELADA', 'CANCELLED') : say('PEDIDO', 'REQUEST')}</span><span className="pm-secondary">{row.id}</span></div><h2>{row.customer}</h2><p>{routeSummary(row.from, row.to, row.stops)}</p><p className="pm-secondary">{DateTime.fromISO(row.allocation.startsAt).setZone(zone).toFormat('dd/MM/yyyy HH:mm')} · {drivers[Number(row.allocation.driverId)]} · {cars[Number(row.allocation.vehicleId)].name}</p><Row label={say('Origem', 'Source')} value={say('WhatsApp / telefone', 'WhatsApp / phone')} /><Row label={say('Total', 'Total')} value={money(row.total)} /><Row label={say('Sinal · 25%', 'Deposit · 25%')} value={money(row.deposit)} /><Row label={say('Saldo', 'Balance')} value={money(row.balance)} />{!row.cancelled && <Button variant="secondary" onClick={() => cancel(row.id)}><Ban size={17} aria-hidden="true" />{say('Cancelar teste', 'Cancel test')}</Button>}</article>)}</div></Section>
  </>;
}
