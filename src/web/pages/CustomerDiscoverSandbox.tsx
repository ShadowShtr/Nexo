import { Fragment, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPinned, Search, Sparkles, Ticket, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { quote } from '../../domain/pricing';
import { RouteMap } from '../components/RouteMap';
import { tourRoute, type DemoRoute } from '../demo-routes';

const tourOptions = [
  { id: 'lisbon', icon: '✦', pt: 'Tour em Lisboa', en: 'Lisbon tour', detailPt: 'Miradouros e centro histórico', detailEn: 'Viewpoints and historic centre' },
  { id: 'sintra', icon: '◈', pt: 'Sintra', en: 'Sintra', detailPt: 'Palácios, serra e mar', detailEn: 'Palaces, hills and sea' },
  { id: 'lisbon-sintra', icon: '↗', pt: 'Lisboa + Sintra', en: 'Lisbon + Sintra', detailPt: 'A experiência completa', detailEn: 'The complete experience' },
  { id: 'custom', icon: '＋', pt: 'Tour à medida', en: 'Custom tour', detailPt: 'O seu ritmo, o seu percurso', detailEn: 'Your pace, your route' },
];

const recentPlaces = [
  { title: 'Sintra', detail: 'Sintra, Lisboa' },
  { title: 'Carregado', detail: 'Carregado, Alenquer' },
  { title: 'Avenida Cabo da Boa Esperança L65', detail: 'Carregado, Alenquer' },
  { title: 'Estação Carregado', detail: 'R. da Estação, Castanheira do Ribatejo' },
  { title: 'Aeroporto de Lisboa', detail: 'Alameda das Comunidades Portuguesas' },
  { title: 'Estação do Oriente', detail: 'Av. Dom João II, Lisboa' },
  { title: 'Centro de Lisboa', detail: 'Lisboa' },
];

const placeCoordinates: ReadonlyArray<{ aliases: string[]; coordinates: readonly [number, number] }> = [
  { aliases: ['lisboa', 'centro de lisboa', 'a minha localizacao'], coordinates: [38.7223, -9.1393] },
  { aliases: ['sintra'], coordinates: [38.8029, -9.3817] },
  { aliases: ['carregado'], coordinates: [39.0234, -8.9768] },
  // Centro geográfico da Avenida Cabo da Boa Esperança (CP 2580-469,
  // Carregado). O lote 65 usa o mesmo arruamento até termos geocoding
  // por porta/lote no fornecedor de mapas.
  { aliases: ['avenida cabo da boa esperanca', 'avenida cabo da boa esperanca l65'], coordinates: [39.0218561, -8.9748176] },
  { aliases: ['estacao carregado'], coordinates: [39.0228, -8.9757] },
  { aliases: ['aeroporto de lisboa', 'aeroporto'], coordinates: [38.7742, -9.1342] },
  { aliases: ['estacao do oriente', 'oriente'], coordinates: [38.7677, -9.0993] },
  { aliases: ['cascais'], coordinates: [38.6979, -9.4215] },
  { aliases: ['setubal', 'setúbal'], coordinates: [38.5244, -8.8882] },
];

function normalizePlace(value: string) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function coordinatesFor(value: string) {
  const normalized = normalizePlace(value);
  return placeCoordinates.find(place => place.aliases.some(alias => normalized === normalizePlace(alias) || normalized.includes(normalizePlace(alias))))?.coordinates;
}

function distanceMeters(from: readonly [number, number], to: readonly [number, number]) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadius = 6_371_000;
  const latitudeDelta = radians(to[0] - from[0]);
  const longitudeDelta = radians(to[1] - from[1]);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(a)) * 1.2);
}

function dynamicRoute(origin: string, destination: string, stops: readonly string[] = []): DemoRoute {
  const labels = [origin || 'Lisboa', ...stops.filter(stop => stop.trim()), destination || 'Destino'];
  const coordinates = labels.map(coordinatesFor);
  const start = coordinates[0] ?? tourRoute.points[0].coordinates;
  if (coordinates.some((point): point is undefined => !point)) {
    return { name: labels.join(' → '), meters: 0, minutes: 0, points: [{ ...tourRoute.points[0], label: labels[0], coordinates: start }], shape: [start] };
  }
  const shape: Array<readonly [number, number]> = [coordinates[0]!];
  let meters = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const from = coordinates[index - 1]!;
    const to = coordinates[index]!;
    meters += distanceMeters(from, to);
    shape.push(
      [from[0] + (to[0] - from[0]) * .33, from[1] + (to[1] - from[1]) * .28],
      [from[0] + (to[0] - from[0]) * .68, from[1] + (to[1] - from[1]) * .78],
      to,
    );
  }
  const points = labels.map((label, index) => ({
    label,
    coordinates: coordinates[index]!,
    kind: index === 0 ? 'pickup' : index === labels.length - 1 ? 'destination' : 'stop',
  } as const));
  return { name: labels.join(' → '), meters, minutes: Math.max(10, Math.round(meters / 1000 / 55 * 60)), points, shape };
}

function plannerRoute(origin: string, destination: string, stops: readonly string[], kind: 'transfer' | 'tour', english: boolean): DemoRoute {
  const stopSuffix = english ? 'stop' : 'paragem';
  if (kind !== 'tour' || normalizePlace(destination) !== 'sintra' || stops.length > 0 || !normalizePlace(origin).includes('lisboa')) return dynamicRoute(origin, destination, stops);
  const points = tourRoute.points.map((point, index) => index === 0
    ? { ...point, label: origin || 'Lisboa' }
    : index === tourRoute.points.length - 1
      ? { ...point, label: 'Cabo da Roca' }
      : point.label.toLocaleLowerCase() === destination.toLocaleLowerCase() ? { ...point, label: `${point.label} · ${stopSuffix}` } : point);
  return { ...tourRoute, name: `${origin || 'Lisboa'} → ${destination}`, points };
}

export default function CustomerDiscoverSandbox() {
  const { i18n } = useTranslation();
  const say = (pt: string, en: string) => i18n.language === 'en' ? en : pt;
  type PlannerKind = 'transfer' | 'tour';
  const [planning, setPlanning] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [plannerKind, setPlannerKind] = useState<PlannerKind>('transfer');
  const [origin, setOrigin] = useState('Lisboa');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState<string[]>([]);
  const [locationState, setLocationState] = useState<'suggested' | 'requesting' | 'fallback'>('suggested');

  const previewRoute = useMemo(() => plannerRoute(origin, destination, stops, plannerKind, i18n.language === 'en'), [origin, destination, plannerKind, stops, i18n.language]);
  const routeKnown = Boolean(origin.trim() && destination.trim() && coordinatesFor(origin) && coordinatesFor(destination) && stops.every(stop => Boolean(coordinatesFor(stop))));
  const destinationSuggestions = useMemo(() => {
    const query = normalizePlace(destination);
    return recentPlaces.filter(place => !query || normalizePlace(`${place.title} ${place.detail}`).includes(query));
  }, [destination]);
  const originPreviewRoute = useMemo<DemoRoute>(() => ({
    name: origin || 'Lisboa', meters: 0, minutes: 0,
    points: [{ ...tourRoute.points[0], label: origin || 'Lisboa' }],
    shape: [tourRoute.points[0].coordinates],
  }), [origin]);
  const tourPrice = quote({ passengers: 2, passengerCapacity: 6, service: { kind: 'tour', baseCents: 20000, extraPassengerCents: 3500 } });
  const transferPrice = quote({ passengers: 2, passengerCapacity: 6, service: { kind: 'transfer', baseCents: 1000, distanceMeters: previewRoute.meters, centsPerKm: 200 } });
  const plannerPrice = plannerKind === 'tour' ? tourPrice : transferPrice;
  const km = new Intl.NumberFormat(i18n.language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(previewRoute.meters / 1000);
  const money = (cents: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(cents / 100);

  const openPlanner = (preset = '', kind: PlannerKind = 'transfer') => {
    setPlanning(true);
    setRouteReady(false);
    setPlannerKind(kind);
    setDestination(preset);
    setStops([]);
  };
  const chooseBooking = () => {
    const url = new URL(window.location.href);
    if (plannerKind === 'tour') url.searchParams.set('tour', '1');
    else url.searchParams.delete('tour');
    url.hash = '#/customer/booking';
    window.location.assign(url.toString());
  };
  const chooseCategory = (id: string) => openPlanner(id === 'lisbon' ? 'Lisboa' : id === 'sintra' || id === 'lisbon-sintra' ? 'Sintra' : '', 'tour');
  const useLocation = () => {
    if (!navigator.geolocation) {
      setOrigin('Lisboa');
      setLocationState('fallback');
      return;
    }
    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      () => { setOrigin('A minha localização'); setLocationState('suggested'); },
      () => { setOrigin('Lisboa'); setLocationState('fallback'); },
      { enableHighAccuracy: false, timeout: 2500 },
    );
  };
  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
  };
  const addStop = () => {
    setStops(current => [...current, '']);
    setRouteReady(false);
  };
  const updateStop = (index: number, value: string) => {
    setStops(current => current.map((stop, stopIndex) => stopIndex === index ? value : stop));
    setRouteReady(false);
  };
  const removeStop = (index: number) => {
    setStops(current => current.filter((_, stopIndex) => stopIndex !== index));
    setRouteReady(false);
  };

  return <div className="pm-client-home">
    <header className="pm-client-toolbar">
      <span className="pm-client-wordmark"><span className="pm-client-mark">pm.</span><strong>Premium Mobility</strong></span>
      <label className="pm-client-language"><span className="pm-sr-only">{say('Idioma', 'Language')}</span><select aria-label={say('Idioma', 'Language')} value={i18n.language} onChange={event => changeLanguage(event.target.value)}><option value="pt-PT">Português</option><option value="en">English</option></select></label>
    </header>

    {!planning && <button type="button" className="pm-client-search" onClick={() => openPlanner()} aria-label={say('Pesquisar um tour', 'Search for a tour')}>
      <Search size={24} strokeWidth={2.2}/><strong>{say('Para onde?', 'Where to?')}</strong><span className="pm-client-later"><CalendarDays size={18}/>{say('Mais tarde', 'Later')}</span>
    </button>}

    {planning ? <section className="pm-client-planner" aria-labelledby="client-planner-title">
      <div className="pm-client-planner-head"><button type="button" className="pm-client-back" onClick={() => { setPlanning(false); setRouteReady(false); }} aria-label={say('Voltar', 'Back')}><ChevronLeft size={24}/></button><div><span className="pm-client-eyebrow">{say('Tour privado', 'Private tour')}</span><h1 id="client-planner-title">{say('Planear a sua viagem', 'Plan your trip')}</h1></div></div>
      <div className="pm-client-planner-pills"><span><Clock3 size={17}/>{say('Mais tarde', 'Later')}</span><span><MapPinned size={17}/>{say('Para mim', 'For me')}</span></div>
      <div className="pm-client-address-card">
        <label className="pm-client-address-row"><span className="pm-client-address-icon pm-client-pickup-icon"><MapPinned size={19}/></span><span className="pm-client-address-field"><small>{say('Local de partida', 'Pickup location')}</small><input aria-label={say('Local de partida', 'Pickup location')} value={origin} onChange={event => { setOrigin(event.target.value); setRouteReady(false); }} placeholder={say('De onde partimos?', 'Where should we pick you up?')} /></span></label>
        <div className="pm-client-address-divider" />
        <label className="pm-client-address-row"><span className="pm-client-address-icon pm-client-destination-icon"><MapPinned size={19}/></span><span className="pm-client-address-field"><small>{say('Destino', 'Destination')}</small><input list="pm-client-destination-options" aria-label={say('Destino', 'Destination')} value={destination} onChange={event => { setDestination(event.target.value); setRouteReady(false); }} placeholder={say('Para onde?', 'Where to?')} /><datalist id="pm-client-destination-options">{recentPlaces.map(place => <option value={place.title} key={place.title}>{place.detail}</option>)}</datalist></span><button type="button" className="pm-client-add-stop" onClick={addStop} aria-label={say('Adicionar paragem', 'Add stop')}>＋</button></label>
        {stops.map((stop, index) => <Fragment key={`stop-${index}`}><div className="pm-client-address-divider" /><label className="pm-client-address-row"><span className="pm-client-address-icon pm-client-stop-icon"><MapPinned size={19}/></span><span className="pm-client-address-field"><small>{say(`Paragem ${index + 1}`, `Stop ${index + 1}`)}</small><input list={`pm-client-stop-options-${index}`} aria-label={say(`Paragem ${index + 1}`, `Stop ${index + 1}`)} value={stop} onChange={event => updateStop(index, event.target.value)} placeholder={say('Adicionar uma morada', 'Add an address')} /><datalist id={`pm-client-stop-options-${index}`}>{recentPlaces.map(place => <option value={place.title} key={place.title}>{place.detail}</option>)}</datalist></span><button type="button" className="pm-client-remove-stop" onClick={() => removeStop(index)} aria-label={say(`Remover paragem ${index + 1}`, `Remove stop ${index + 1}`)}><X size={17}/></button></label></Fragment>)}
      </div>
      {destination.trim() && <div className="pm-client-inline-suggestions" role="listbox" aria-label={say('Sugestões de morada', 'Address suggestions')}>{destinationSuggestions.length ? destinationSuggestions.map(place => <button type="button" role="option" className="pm-client-inline-suggestion" key={place.title} onClick={() => { setDestination(place.title); setRouteReady(false); }}><MapPinned size={17}/><span><strong>{place.title}</strong><small>{place.detail}</small></span><ChevronRight size={16}/></button>) : <p>{say('Nenhuma sugestão local. Escolha uma morada reconhecida na lista abaixo.', 'No local suggestion. Choose a recognised address from the list below.')}</p>}</div>}
      <RouteMap route={destination.trim() && routeKnown ? previewRoute : originPreviewRoute} language={i18n.language === 'en' ? 'en' : 'pt'} mode={destination.trim() && routeKnown ? 'full' : 'preview'} previewMessage={destination.trim() && !routeKnown ? say('Escolha um endereço sugerido para calcular quilómetros e preço.', 'Choose a suggested address to calculate distance and price.') : say('Escolha um destino para calcular quilómetros e preço.', 'Choose a destination to calculate distance and price.')}/>
      <button type="button" className="pm-client-location-button" onClick={useLocation}><MapPinned size={18}/>{locationState === 'requesting' ? say('A localizar…', 'Locating…') : say('Usar localização atual', 'Use current location')}</button>
      <p className="pm-client-field-help">{locationState === 'fallback' ? say('Localização indisponível; Lisboa foi preenchida como exemplo.', 'Location unavailable; Lisbon was filled as an example.') : !routeKnown && destination.trim() ? say('O endereço ainda não foi reconhecido; escolha uma sugestão da lista.', 'The address is not recognised yet; choose a suggestion from the list.') : say('A origem fica sugerida e pode ser alterada antes de calcular.', 'Pickup is suggested and can be changed before calculating.')}</p>
      {!destination.trim() && !routeReady && <div className="pm-client-suggestions"><div className="pm-client-suggestions-title"><strong>{say('Locais recentes', 'Recent places')}</strong><span>{say('Toque para preencher o destino', 'Tap to fill destination')}</span></div>{recentPlaces.map(place => <button type="button" className="pm-client-suggestion" key={place.title} onClick={() => { setDestination(place.title); setRouteReady(false); }}><span className="pm-client-suggestion-pin"><Clock3 size={17}/></span><span><strong>{place.title}</strong><small>{place.detail}</small></span><ChevronRight size={17}/></button>)}</div>}
      {!routeReady ? <button type="button" className="pm-client-primary-action" onClick={() => setRouteReady(Boolean(origin.trim() && destination.trim() && routeKnown))} disabled={!origin.trim() || !destination.trim() || !routeKnown}>{say('Ver rota e preço', 'See route and price')}<ChevronRight size={19}/></button> : <div className="pm-client-route-quote"><div className="pm-client-route-quote-head"><div><span>{plannerKind === 'tour' ? say('Estimativa do tour', 'Tour estimate') : say('Estimativa do transfer', 'Transfer estimate')}</span><strong>{money(plannerPrice.totalCents)}</strong></div><span className="pm-client-route-badge">{plannerKind === 'tour' ? say('2 dias', '2 days') : say('Transfer', 'Transfer')}</span></div><div className="pm-client-route-stats"><span><strong>{km} km</strong>{say('percurso previsto', 'planned route')}</span><span><strong>{previewRoute.minutes} min</strong>{say('tempo de condução', 'driving time')}</span><span><strong>{money(plannerPrice.depositCents)}</strong>{say('sinal · 25%', 'deposit · 25%')}</span></div><p>{plannerKind === 'tour' ? say('Inclui até 2 pessoas. Cada pessoa adicional acrescenta 35,00 €. A disponibilidade do motorista será confirmada no passo seguinte.', 'Includes up to 2 people. Each additional person adds €35. Driver availability is confirmed in the next step.') : say(`Cálculo de demonstração: ${money(1000)} de base + ${money(200)} por km. Paragens incluídas no percurso; a tarifa real será definida pelo proprietário.`, `Demo calculation: ${money(1000)} base + ${money(200)} per km. Stops are included in the route; the owner will define the live tariff.`)}</p><button type="button" className="pm-client-primary-action" onClick={chooseBooking}>{say('Escolher motorista e carro', 'Choose driver and vehicle')}<ChevronRight size={19}/></button></div>}
    </section> : <>
      <section className="pm-client-categories" aria-labelledby="client-adventure-title">
        <div className="pm-client-section-title"><h1 id="client-adventure-title">{say('Escolhe a tua aventura.', 'Choose your adventure.')}</h1><span className="pm-client-spark"><Sparkles size={18}/></span></div>
        <div className="pm-client-category-grid">{tourOptions.map(option => <button type="button" className="pm-client-category" key={option.id} onClick={() => chooseCategory(option.id)}><span className="pm-client-category-art" aria-hidden="true">{option.icon}</span><strong>{say(option.pt, option.en)}</strong><span>{say(option.detailPt, option.detailEn)}</span></button>)}</div>
      </section>
      <button type="button" className="pm-client-tour-promo" onClick={() => openPlanner('Sintra', 'tour')} aria-label={say('Abrir tour Lisboa Sintra', 'Open Lisbon Sintra tour')}><img src="/lisbon-sintra-tour.png" alt=""/><span className="pm-client-tour-shade"/><span className="pm-client-tour-copy"><span className="pm-client-kicker"><Ticket size={15}/> {say('Experiência privada', 'Private experience')}</span><strong>Lisboa <span>→</span> Sintra</strong><span>{say('Do centro histórico aos palácios da serra.', 'From the historic centre to the hilltop palaces.')}</span><span className="pm-client-tour-meta"><Clock3 size={15}/> {say('2 dias · até 2 pessoas incluídas', '2 days · up to 2 people included')}</span><span className="pm-client-tour-action">{say('Ver tour', 'View tour')} <ChevronRight size={18}/></span></span></button>
      <p className="pm-client-note">{say('Valores e disponibilidade são confirmados antes do pedido.', 'Prices and availability are confirmed before your request.')}</p>
    </>}
  </div>;
}
