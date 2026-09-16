import { useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, CalendarPlus, ChevronRight, MessageCircle } from 'lucide-react';
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

export function OwnerHomeSandbox() {
  const { i18n } = useTranslation();
  const en = i18n.language === 'en';
  const say = (pt: string, english: string) => en ? english : pt;
  const [incoming, setIncoming] = useState<DemoCustomerRequest[]>(() => readDemoCustomerRequests());
  useEffect(() => { const refresh = () => setIncoming(readDemoCustomerRequests()); return subscribeToDemoCustomerRequests(refresh); }, []);
  const locale = en ? 'en-GB' : 'pt-PT';
  const today = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const activeRequests = incoming.filter(request => !request.cancelled);
  const todayKey = dateKey(new Date());
  const todayTrips = demoTrips.filter(trip => trip.day === todayKey);
  const todayRequests = activeRequests.filter(request => dateKey(request.allocation.startsAt) === todayKey);
  const scheduled = todayTrips.length + todayRequests.length;
  const revenue = todayTrips.reduce((sum, trip) => sum + trip.cents, 0) + todayRequests.reduce((sum, request) => sum + request.total, 0);
  const attention = useMemo(() => [
    ...activeRequests.map(request => ({ id: request.id, name: request.name, date: request.allocation.startsAt, route: `${request.origin} → ${request.destination}`, detail: request.email, incoming: true })),
    ...demoTrips.slice(0, 4).map(trip => ({ id: trip.id, name: ['Ana Exemplo', 'Daniel Exemplo', 'Emma Example', 'Tom Example'][trip.customer], date: `${trip.day}T${trip.time}:00+01:00`, route: `${trip.from} → ${trip.to}`, detail: `${trip.time} · ${cars[trip.car]}`, incoming: false })),
  ], [activeRequests]);
  return <div className="pm-owner-dashboard">
    <header className="pm-owner-dashboard-header"><div><p className="pm-owner-greeting">{say('Olá, Vitor! 👋', 'Hello, Vitor! 👋')}</p><p className="pm-owner-date">{today}</p></div><button type="button" className="pm-owner-notification" aria-label={say('Notificações', 'Notifications')}><Bell size={21}/><span aria-hidden="true"/></button></header>
    <section className="pm-owner-next-card"><div><span className="pm-owner-kicker">{say('Próxima operação', 'Next operation')}</span>{activeRequests[0] ? <><h2>{activeRequests[0].origin} → {activeRequests[0].destination}</h2><p>{activeRequests[0].name} · {new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(activeRequests[0].allocation.startsAt))}</p></> : <><h2>{say('Sem marcações para hoje', 'No bookings for today')}</h2><p>{say('As próximas viagens aparecerão aqui assim que forem recebidas.', 'Upcoming trips will appear here as soon as they arrive.')}</p></>}</div><a className="pm-owner-outline-action" href="#/owner/bookings"><CalendarPlus size={17}/>{say('Criar marcação', 'Create booking')}</a></section>
    <section className="pm-owner-section"><div className="pm-owner-section-heading"><h2>{say('Resumo do dia', 'Today at a glance')}</h2><a href="#/owner/calendar">{say('Abrir agenda', 'Open calendar')}<ChevronRight size={16}/></a></div><div className="pm-owner-metrics"><article><span className="pm-owner-metric-icon pm-owner-metric-pink"><AssetIcon src="/owner-icon-calendar.png" /></span><div><strong>{scheduled}</strong><span>{say('Marcações', 'Bookings')}</span><small>{say('Hoje', 'Today')}</small></div></article><article><span className="pm-owner-metric-icon pm-owner-metric-green"><AssetIcon src="/owner-icon-wallet.png" /></span><div><strong>{money(revenue, i18n.language)}</strong><span>{say('Faturação prevista', 'Expected revenue')}</span><small>{say('Hoje', 'Today')}</small></div></article><article><span className="pm-owner-metric-icon pm-owner-metric-amber"><BellRing size={20}/></span><div><strong>{attention.length}</strong><span>{say('Lembretes', 'Reminders')}</span><small>{say('A acompanhar', 'To follow up')}</small></div></article><article><span className="pm-owner-metric-icon pm-owner-metric-blue"><AssetIcon src="/owner-icon-person.png" /></span><div><strong>{activeRequests.length}</strong><span>{say('Pedidos pendentes', 'Pending requests')}</span><small>{say('Vindos do cliente', 'From customers')}</small></div></article></div></section>
    <section className="pm-owner-section"><div className="pm-owner-section-heading"><h2>{say('Precisa da sua atenção', 'Needs your attention')}</h2><a href="#/owner/bookings">{say('Ver todos', 'View all')}<ChevronRight size={16}/></a></div><div className="pm-owner-attention-list">{attention.length ? attention.map(item => <a className="pm-owner-attention-row pm-demo-record" href="#/owner/bookings" key={item.id}><span className="pm-owner-row-icon"><AssetIcon src={item.incoming ? '/owner-icon-person.png' : '/owner-icon-car-front.png'} /></span><span className="pm-owner-row-copy"><strong>{item.name}</strong><small>{new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(item.date))} · {item.route}</small><small>{item.detail}</small></span><span className="pm-owner-row-message" aria-label={say('Abrir pedido', 'Open request')}><MessageCircle size={17}/></span><ChevronRight className="pm-owner-row-chevron" size={18}/></a>) : <p className="pm-owner-empty">{say('Nenhum pedido pendente.', 'No pending requests.')}</p>}</div></section>
    <section className="pm-owner-section"><div className="pm-owner-section-heading"><h2>{say('Atalhos rápidos', 'Quick shortcuts')}</h2></div><div className="pm-owner-shortcuts"><a href="#/owner/bookings"><span><AssetIcon src="/owner-icon-calendar.png" /></span><strong>{say('Nova marcação', 'New booking')}</strong><small>{say('Registar um pedido por telefone ou WhatsApp', 'Record a phone or WhatsApp request')}</small><ChevronRight size={17}/></a><a href="#/customer/discover"><span><AssetIcon src="/owner-icon-search.png" /></span><strong>{say('Link da página', 'Page link')}</strong><small>{say('Abrir a experiência pública do cliente', 'Open the customer experience')}</small><ChevronRight size={17}/></a><a href="#/owner/settings"><span><AssetIcon src="/owner-icon-card.png" /></span><strong>{say('Configurar operação', 'Configure operation')}</strong><small>{say('Valores, regras e publicação', 'Prices, rules and publishing')}</small><ChevronRight size={17}/></a></div></section>
  </div>;
}
