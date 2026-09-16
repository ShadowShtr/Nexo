import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Clock3, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { demoTrips } from './DemoPage';
import { readDemoCustomerRequests, subscribeToDemoCustomerRequests, type DemoCustomerRequest } from '../demo-request-store';

const cars = ['Mercedes-Benz Classe E', 'Mercedes-Benz Classe V', 'BMW Série 5', 'Volvo XC90'];

function AssetIcon({ src }: { src: string }) {
  return <img className="pm-owner-icon-art" src={src} alt="" aria-hidden="true" />;
}

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function dateKey(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

type UpcomingItem = {
  id: string;
  name: string;
  date: string;
  route: string;
  detail: string;
  value: number;
  incoming: boolean;
};

export function OwnerHomeSandbox() {
  const { i18n } = useTranslation();
  const en = i18n.language === 'en';
  const say = (pt: string, english: string) => en ? english : pt;
  const [incoming, setIncoming] = useState<DemoCustomerRequest[]>(() => readDemoCustomerRequests());
  useEffect(() => { const refresh = () => setIncoming(readDemoCustomerRequests()); return subscribeToDemoCustomerRequests(refresh); }, []);

  const locale = en ? 'en-GB' : 'pt-PT';
  const shortToday = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date());
  const activeRequests = incoming.filter(request => !request.cancelled);
  const todayKey = dateKey(new Date());
  const todayTrips = demoTrips.filter(trip => trip.day === todayKey);
  const todayRequests = activeRequests.filter(request => dateKey(request.allocation.startsAt) === todayKey);
  const scheduledToday = todayTrips.length + todayRequests.length;
  const revenueToday = todayTrips.reduce((sum, trip) => sum + trip.cents, 0) + todayRequests.reduce((sum, request) => sum + request.total, 0);

  const upcoming = useMemo<UpcomingItem[]>(() => [
    ...activeRequests.map(request => ({
      id: request.id,
      name: request.name,
      date: request.allocation.startsAt,
      route: `${request.origin} → ${request.destination}`,
      detail: `${request.people} ${say('passageiros', 'passengers')}`,
      value: request.total,
      incoming: true,
    })),
    ...demoTrips.map(trip => ({
      id: trip.id,
      name: ['Ana Exemplo', 'Daniel Exemplo', 'Emma Example', 'Tom Example'][trip.customer],
      date: `${trip.day}T${trip.time}:00+01:00`,
      route: `${trip.from} → ${trip.to}`,
      detail: `${trip.time} · ${cars[trip.car]}`,
      value: trip.cents,
      incoming: false,
    })),
  ], [activeRequests, en]);

  const nextService = upcoming[0] ?? {
    id: 'next-service',
    name: say('Sem serviço agendado', 'No service scheduled'),
    date: new Date().toISOString(),
    route: say('As próximas viagens aparecerão aqui', 'Upcoming trips will appear here'),
    detail: '',
    value: 0,
    incoming: false,
  };

  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(value));
  const formatTime = (value: string) => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  const upcomingIcon = (route: string) => route.toLocaleLowerCase().includes('aeroporto') ? '/owner-icon-plane.png' : route.includes('→') ? '/owner-icon-pin.png' : '/owner-icon-car-front.png';

  return <div className="pm-owner-dashboard">
    <header className="pm-owner-dashboard-header">
      <div>
        <h1 className="pm-owner-page-title">{say('Início', 'Home')}</h1>
        <p className="pm-owner-greeting">{say('Bom dia, Vitor', 'Good morning, Vitor')}</p>
        <p className="pm-owner-subtitle">{say('Onde o podemos levar hoje?', 'Where can we take you today?')}</p>
      </div>
      <button type="button" className="pm-owner-profile" aria-label={say('Perfil', 'Profile')}><AssetIcon src="/owner-icon-person.png" /></button>
    </header>

    <section className="pm-owner-summary-card">
      <div className="pm-owner-summary-heading"><div><h2>{say('Resumo de hoje', 'Today at a glance')}</h2><p>{shortToday}</p></div><button type="button" className="pm-owner-summary-menu" aria-label={say('Mais opções', 'More options')}>•••</button></div>
      <div className="pm-owner-summary-metrics">
        <article><span className="pm-owner-metric-icon"><AssetIcon src="/owner-icon-car-front.png" /></span><strong>{scheduledToday}</strong><span>{say('viagens', 'trips')}</span></article>
        <article><span className="pm-owner-metric-icon"><AssetIcon src="/owner-icon-wallet.png" /></span><strong>{money(revenueToday, i18n.language)}</strong><span>{say('faturação hoje', 'revenue today')}</span></article>
        <article><span className="pm-owner-metric-icon"><AssetIcon src="/owner-icon-calendar.png" /></span><strong>{upcoming.length}</strong><span>{say('próximas', 'upcoming')}</span></article>
      </div>
    </section>

    <section className="pm-owner-section">
      <div className="pm-owner-section-heading"><h2>{say('Próximas marcações', 'Upcoming bookings')}</h2><a href="#/owner/bookings">{say('Ver todas', 'View all')}<ChevronRight size={16} /></a></div>
      <div className="pm-owner-upcoming-list">
        {upcoming.slice(0, 2).map(item => <a className="pm-owner-upcoming-row pm-demo-record" href="#/owner/bookings" key={item.id}>
          <span className="pm-owner-upcoming-icon"><AssetIcon src={upcomingIcon(item.route)} /></span>
          <span className="pm-owner-upcoming-copy"><strong>{item.route}</strong><small>{formatDate(item.date)} · {formatTime(item.date)}</small><small><UsersRound size={14} /> {item.detail}</small></span>
          <span className="pm-owner-upcoming-value"><span className={`pm-owner-status ${item.incoming ? 'is-pending' : ''}`}>{item.incoming ? say('A aguardar', 'Pending') : say('Agendada', 'Scheduled')}</span><strong>{money(item.value, i18n.language)}</strong></span>
          <ChevronRight className="pm-owner-row-chevron" size={18} />
        </a>)}
        {!upcoming.length && <p className="pm-owner-empty">{say('Nenhuma marcação agendada.', 'No bookings scheduled.')}</p>}
      </div>
    </section>

    <section className="pm-owner-section">
      <div className="pm-owner-section-heading"><h2>{say('Ações rápidas', 'Quick actions')}</h2></div>
      <div className="pm-owner-shortcuts">
        <a href="#/owner/bookings"><span><AssetIcon src="/owner-icon-calendar.png" /></span><strong>{say('Agendar', 'Schedule')}</strong><small>{say('Nova viagem', 'New trip')}</small><ChevronRight size={17} /></a>
        <a href="#/owner/bookings"><span><AssetIcon src="/owner-icon-car-front.png" /></span><strong>{say('As minhas viagens', 'My trips')}</strong><small>{say('Histórico e próximas', 'History and upcoming')}</small><ChevronRight size={17} /></a>
        <a href="#/owner/tours"><span><AssetIcon src="/owner-icon-tours.png" /></span><strong>{say('Tours', 'Tours')}</strong><small>{say('Destinos exclusivos', 'Exclusive destinations')}</small><ChevronRight size={17} /></a>
        <a href="#/owner/finance"><span><AssetIcon src="/owner-icon-card.png" /></span><strong>{say('Pagamento', 'Payment')}</strong><small>{say('Cartões e métodos', 'Cards and methods')}</small><ChevronRight size={17} /></a>
      </div>
    </section>

    <section className="pm-owner-section">
      <div className="pm-owner-section-heading"><h2>{say('Próximo serviço', 'Next service')}</h2></div>
      <a className="pm-owner-next-service pm-demo-record" href="#/owner/bookings"><span className="pm-owner-upcoming-icon"><AssetIcon src="/owner-icon-car-front.png" /></span><span className="pm-owner-upcoming-copy"><strong>{nextService.route}</strong><small><UsersRound size={14} /> {nextService.name}</small><small><Clock3 size={14} /> {nextService.detail || say('Aguardando nova marcação', 'Waiting for a new booking')}</small></span><ChevronRight className="pm-owner-row-chevron" size={18} /></a>
    </section>
  </div>;
}
