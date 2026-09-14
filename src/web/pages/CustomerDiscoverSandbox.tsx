import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPinned, Search, Sparkles, Ticket } from 'lucide-react';
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
  { title: 'Aeroporto de Lisboa', detail: 'Alameda das Comunidades Portuguesas' },
  { title: 'Estação do Oriente', detail: 'Av. Dom João II, Lisboa' },
  { title: 'Centro de Lisboa', detail: 'Lisboa' },
];

function plannerRoute(origin: string, destination: string, english: boolean): DemoRoute {
  const stopSuffix = english ? 'stop' : 'paragem';
  const points = tourRoute.points.map((point, index) => index === 0
    ? { ...point, label: origin || 'Lisboa' }
    : index === tourRoute.points.length - 1
      ? { ...point, label: destination && destination.toLocaleLowerCase() !== 'sintra' ? destination : 'Cabo da Roca' }
      : point.label.toLocaleLowerCase() === destination.toLocaleLowerCase() ? { ...point, label: `${point.label} · ${stopSuffix}` } : point);
  return { ...tourRoute, name: `${origin || 'Lisboa'} → ${destination || 'Cabo da Roca'}`, points };
}

export default function CustomerDiscoverSandbox() {
  const { i18n } = useTranslation();
  const say = (pt: string, en: string) => i18n.language === 'en' ? en : pt;
  const [planning, setPlanning] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [origin, setOrigin] = useState('Lisboa');
  const [destination, setDestination] = useState('');
  const [locationState, setLocationState] = useState<'suggested' | 'requesting' | 'fallback'>('suggested');

  const previewRoute = useMemo(() => plannerRoute(origin, destination, i18n.language === 'en'), [origin, destination, i18n.language]);
  const originPreviewRoute = useMemo<DemoRoute>(() => ({
    name: origin || 'Lisboa', meters: 0, minutes: 0,
    points: [{ ...tourRoute.points[0], label: origin || 'Lisboa' }],
    shape: [tourRoute.points[0].coordinates],
  }), [origin]);
  const tourPrice = quote({ passengers: 2, passengerCapacity: 6, service: { kind: 'tour', baseCents: 20000, extraPassengerCents: 3500 } });
  const km = new Intl.NumberFormat(i18n.language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(previewRoute.meters / 1000);
  const money = (cents: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(cents / 100);

  const openPlanner = (preset = '') => {
    setPlanning(true);
    setRouteReady(false);
    setDestination(preset);
  };
  const chooseTour = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tour', '1');
    url.hash = '#/customer/booking';
    window.location.assign(url.toString());
  };
  const chooseCategory = (id: string) => openPlanner(id === 'lisbon' ? 'Lisboa' : id === 'sintra' || id === 'lisbon-sintra' ? 'Sintra' : '');
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
        <label className="pm-client-address-row"><span className="pm-client-address-icon pm-client-destination-icon"><MapPinned size={19}/></span><span className="pm-client-address-field"><small>{say('Destino', 'Destination')}</small><input aria-label={say('Destino', 'Destination')} value={destination} onChange={event => { setDestination(event.target.value); setRouteReady(false); }} placeholder={say('Para onde?', 'Where to?')} /></span><span className="pm-client-add-stop" aria-hidden="true">＋</span></label>
      </div>
      <RouteMap route={destination.trim() ? previewRoute : originPreviewRoute} language={i18n.language === 'en' ? 'en' : 'pt'} mode={destination.trim() ? 'full' : 'preview'} previewMessage={say('Escolha um destino para calcular quilómetros e preço.', 'Choose a destination to calculate distance and price.')}/>
      <button type="button" className="pm-client-location-button" onClick={useLocation}><MapPinned size={18}/>{locationState === 'requesting' ? say('A localizar…', 'Locating…') : say('Usar localização atual', 'Use current location')}</button>
      <p className="pm-client-field-help">{locationState === 'fallback' ? say('Localização indisponível; Lisboa foi preenchida como exemplo.', 'Location unavailable; Lisbon was filled as an example.') : say('A origem fica sugerida e pode ser alterada antes de calcular.', 'Pickup is suggested and can be changed before calculating.')}</p>
      <div className="pm-client-suggestions"><div className="pm-client-suggestions-title"><strong>{say('Locais recentes', 'Recent places')}</strong><span>{say('Toque para preencher o destino', 'Tap to fill destination')}</span></div>{recentPlaces.map(place => <button type="button" className="pm-client-suggestion" key={place.title} onClick={() => { setDestination(place.title); setRouteReady(false); }}><span className="pm-client-suggestion-pin"><Clock3 size={17}/></span><span><strong>{place.title}</strong><small>{place.detail}</small></span><ChevronRight size={17}/></button>)}</div>
      {!routeReady ? <button type="button" className="pm-client-primary-action" onClick={() => setRouteReady(Boolean(origin.trim() && destination.trim()))} disabled={!origin.trim() || !destination.trim()}>{say('Ver rota e preço', 'See route and price')}<ChevronRight size={19}/></button> : <div className="pm-client-route-quote"><div className="pm-client-route-quote-head"><div><span>{say('Estimativa do tour', 'Tour estimate')}</span><strong>{money(tourPrice.totalCents)}</strong></div><span className="pm-client-route-badge">{say('2 dias', '2 days')}</span></div><div className="pm-client-route-stats"><span><strong>{km} km</strong>{say('percurso previsto', 'planned route')}</span><span><strong>{previewRoute.minutes} min</strong>{say('tempo de condução', 'driving time')}</span><span><strong>{money(tourPrice.depositCents)}</strong>{say('sinal · 25%', 'deposit · 25%')}</span></div><p>{say('Inclui até 2 pessoas. Cada pessoa adicional acrescenta 35,00 €. A disponibilidade do motorista será confirmada no passo seguinte.', 'Includes up to 2 people. Each additional person adds €35. Driver availability is confirmed in the next step.')}</p><button type="button" className="pm-client-primary-action" onClick={chooseTour}>{say('Escolher motorista e carro', 'Choose driver and vehicle')}<ChevronRight size={19}/></button></div>}
    </section> : <>
      <section className="pm-client-categories" aria-labelledby="client-adventure-title">
        <div className="pm-client-section-title"><h1 id="client-adventure-title">{say('Escolhe a tua aventura.', 'Choose your adventure.')}</h1><span className="pm-client-spark"><Sparkles size={18}/></span></div>
        <div className="pm-client-category-grid">{tourOptions.map(option => <button type="button" className="pm-client-category" key={option.id} onClick={() => chooseCategory(option.id)}><span className="pm-client-category-art" aria-hidden="true">{option.icon}</span><strong>{say(option.pt, option.en)}</strong><span>{say(option.detailPt, option.detailEn)}</span></button>)}</div>
      </section>
      <button type="button" className="pm-client-tour-promo" onClick={() => openPlanner('Sintra')} aria-label={say('Abrir tour Lisboa Sintra', 'Open Lisbon Sintra tour')}><img src="/lisbon-sintra-tour.png" alt=""/><span className="pm-client-tour-shade"/><span className="pm-client-tour-copy"><span className="pm-client-kicker"><Ticket size={15}/> {say('Experiência privada', 'Private experience')}</span><strong>Lisboa <span>→</span> Sintra</strong><span>{say('Do centro histórico aos palácios da serra.', 'From the historic centre to the hilltop palaces.')}</span><span className="pm-client-tour-meta"><Clock3 size={15}/> {say('2 dias · até 2 pessoas incluídas', '2 days · up to 2 people included')}</span><span className="pm-client-tour-action">{say('Ver tour', 'View tour')} <ChevronRight size={18}/></span></span></button>
      <p className="pm-client-note">{say('Valores e disponibilidade são confirmados antes do pedido.', 'Prices and availability are confirmed before your request.')}</p>
    </>}
  </div>;
}
