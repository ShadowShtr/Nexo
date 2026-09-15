import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CalendarDays, CalendarCheck2, ChevronRight, Ellipsis, Globe2, Handshake, MoveUpRight, RotateCcw, UsersRound, Wallet } from 'lucide-react';
import { areas, hrefFor, icons, parseRoute, type Area, type Page } from './navigation';
import { Button } from '../ui/components/Button';
import { Empty, Header, Section, Shortcut } from '../ui/components/Primitives';
import { SettingsPage } from './pages/SettingsPage';
import { DemoPage } from './pages/DemoPage';
import { TourSimulator } from './pages/TourSimulator';
import { AuthGate } from './auth/AuthGate';
import { SessionControl } from './auth/SessionControl';
import { CatalogSandbox } from './pages/CatalogSandbox';
import { BookingSandbox } from './pages/BookingSandbox';
import { DriverServicesSandbox } from './pages/DriverServicesSandbox';
import { CustomerCrmSandbox } from './pages/CustomerCrmSandbox';
import { TourSandbox } from './pages/TourSandbox';
const CustomerSandbox = lazy(() => import('./pages/CustomerSandbox'));
const CustomerDiscoverSandbox = lazy(() => import('./pages/CustomerDiscoverSandbox'));
const CalendarSandbox = lazy(() => import('./pages/CalendarSandbox'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));

function Language() {
  const { t, i18n } = useTranslation();
  return <label className="pm-language"><Globe2 size={17}/><span className="pm-sr-only">{t('language')}</span><select aria-label={t('language')} value={i18n.language} onChange={e => { const language = e.target.value; void i18n.changeLanguage(language); const url = new URL(window.location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url); }}><option value="pt-PT">Português</option><option value="en">English</option></select></label>;
}
function Home({ area }: { area: Area }) {
  const { t } = useTranslation();
  const agenda = area === 'owner' ? 'calendar' : 'availability';
  return <><div className="pm-columns pm-dashboard"><section className="pm-summary pm-hero"><div className="pm-hero-top"><span className="pm-eyebrow">{t('nextService')}</span><CalendarDays size={22} strokeWidth={1.4}/></div><h2>{t('noNext')}</h2><p className="pm-secondary">{t('noNextBody')}</p><Button asChild variant="secondary"><a href={hrefFor(area, agenda)}>{t('seeCalendar')}<ArrowRight size={17}/></a></Button></section><div className="pm-card pm-welcome"><div className="pm-monogram">pm.</div><h2>{t('ready')}</h2><p className="pm-secondary">{t('readyBody')}</p><span className="pm-status" data-tone="neutral">{t('preview')}</span></div></div>
    <Section title={t('quick')}><div className="pm-shortcut-grid"><Shortcut title={t('calendar')} description={t('calendarBody')} href={hrefFor(area, agenda)} icon={<CalendarDays/>}/><Shortcut title={t(area === 'owner' ? 'bookings' : 'services')} description={t('bookingsBody')} href={hrefFor(area, area === 'owner' ? 'bookings' : 'services')} icon={<CalendarCheck2/>}/><Shortcut title={t(area === 'owner' ? 'customers' : 'earnings')} description={t(area === 'owner' ? 'customersBody' : 'earningsBody')} href={hrefFor(area, area === 'owner' ? 'customers' : 'earnings')} icon={area === 'owner' ? <UsersRound/> : <Wallet/>}/></div></Section>
    <Section title={t('activity')}><div className="pm-card"><Empty title={t('noEvents')} description={t('notConnected')}/></div></Section></>;
}
function Collection({ page }: { page: Page }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  return <><div className="pm-search-row"><label className="pm-search"><span className="pm-sr-only">{t('search')}</span><input type="search" placeholder={`${t('search')}…`} value={query} onChange={e => setQuery(e.target.value)}/></label><span className="pm-status" data-tone="neutral">{t('unavailable')}</span></div><div className="pm-card"><Empty title={t(query ? 'noSearch' : 'noRecords')} description={t('noRecordsBody')}>{query && <Button variant="secondary" onClick={() => setQuery('')}><RotateCcw size={17} aria-hidden="true" />{t('clear')}</Button>}</Empty></div><p className="pm-note">{t('notConnected')}</p>{page === 'tours' && <TourSimulator/>}</>;
}
function Finance({ settlement = false }: { settlement?: boolean }) {
  const { t } = useTranslation();
  return <><div className="pm-summary pm-finance-summary"><div className="pm-hero-top"><span>{t(settlement ? 'due' : 'received')}</span>{settlement ? <Handshake size={24}/> : <Wallet size={24}/>}</div><p className="pm-value" aria-label={t('unavailable')}>—</p><p className="pm-secondary">{t('unavailable')}</p><div className="pm-summary-split"><div><p>{t('pending')}</p><strong>—</strong></div><div><p>{t('refunded')}</p><strong>—</strong></div></div></div><Section title={t('ledger')}><div className="pm-card"><Empty title={t('noMovements')} description={t(settlement ? 'settlementNote' : 'notConnected')}/></div></Section></>;
}
function CustomerPage({ page }: { page: Page }) {
  const { t } = useTranslation();
  if(page === 'lookup') return <div className="pm-card"><Empty title={t('lookup')} description={t('lookupNote')}/></div>;
  return <>{page === 'discover' && <section className="pm-summary pm-customer-hero"><span className="pm-eyebrow">{t('chooseLanguage')}</span><h2>{t('welcome')}</h2><p className="pm-secondary">{t('welcomeBody')}</p><Button asChild variant="secondary"><a href={hrefFor('customer', 'booking')}>{t('start')}<MoveUpRight size={18}/></a></Button></section>}<Section title={t('drivers')}><div className="pm-card"><Empty title={t('noDrivers')} description={t('noDriversBody')}/></div></Section></>;
}
export function App() {
  const [demo, setDemo] = useState(() => new URLSearchParams(window.location.search).get('demo') === '1');
  const { t, i18n } = useTranslation();
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => { const update = () => { setRoute(parseRoute(window.location.hash)); window.scrollTo(0, 0); }; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  useEffect(() => { document.documentElement.lang = i18n.language; document.title = `${t(route.page)} · Premium Mobility`; }, [i18n.language, route.page, t]);
  useEffect(() => { document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }); }, [route.area, route.page]);
  const { area, page } = route;
  const pages = areas[area];
  const primary: readonly Page[] = area === 'owner' ? ['home', 'calendar', 'bookings'] : area === 'driver' ? ['home', 'services', 'availability'] : pages;
  const customerHomeDemo = demo && area === 'customer' && page === 'discover';
  const mobilePrimary: readonly Page[] = area === 'customer' ? primary.filter(target => target !== 'booking') : primary;
  const link = (target: Page | 'more', mobile = false) => {
    const Icon = target === 'more' ? Ellipsis : customerHomeDemo && target === 'discover' ? icons.home : customerHomeDemo && target === 'lookup' ? icons.profile : icons[target];
    const customerFlow = area === 'customer' && page === 'booking';
    const active = customerFlow ? target === 'discover' : target === page || (target === 'more' && !primary.includes(page as Page));
    const label = customerHomeDemo && target === 'discover' ? t('home') : customerHomeDemo && target === 'booking' ? t('activity') : customerHomeDemo && target === 'lookup' ? (i18n.language === 'en' ? 'Account' : 'Conta') : t(target);
    return <a key={target} href={hrefFor(area, target)} className={`pm-nav-link ${active ? 'pm-active' : ''}`} aria-current={active ? 'page' : undefined}><Icon size={mobile ? 19 : 20} strokeWidth={1.7}/><span>{label}</span></a>;
  };
  const now = new Intl.DateTimeFormat(i18n.language, { timeZone: 'Europe/Lisbon', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
      return <AuthGate area={area} demo={demo}><div className={`pm-theme pm-app ${customerHomeDemo ? 'pm-client-app' : ''}`}><a className="pm-skip" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{t('skip')}</a><aside className="pm-sidebar"><a className="pm-brand" href={hrefFor(area, pages[0])}><span className="pm-logo">pm.</span><span>Premium<br/><strong>Mobility</strong></span></a><span className="pm-eyebrow pm-nav-caption">{t(area)}</span><nav aria-label={t(area)}>{pages.map(p => link(p))}</nav><div className="pm-sidebar-footer"><p>{t('footer')}</p><span>v0.2.67 · {t('preview')}</span></div></aside>
    <div className="pm-main-shell"><div className="pm-topbar"><span className="pm-workspace">{t('workspace')}</span><div className="pm-topbar-controls"><label className="pm-role"><span className="pm-sr-only">{t('viewAs')}</span><select aria-label={t('viewAs')} value={area} onChange={e => { const selected = e.target.value as Area; window.location.hash = hrefFor(selected, areas[selected][0]); }}>{Object.keys(areas).map(a => <option key={a} value={a}>{t(a)}</option>)}</select></label><Language/><SessionControl demo={demo}/></div></div><div className="pm-preview-banner"><span className="pm-dot"/>{t('previewNote')}<label className="pm-switch"><input type="checkbox" checked={demo} onChange={e => { setDemo(e.target.checked); const url = new URL(window.location.href); url.searchParams.set('demo', e.target.checked ? '1' : '0'); history.replaceState(null, '', url); }}/>{i18n.language === 'en' ? 'Test data' : 'Dados de teste'}</label></div>
    <main id="main" tabIndex={-1} className={`pm-page pm-safe-bottom ${customerHomeDemo ? 'pm-client-page' : ''}`}>{!customerHomeDemo && <Header eyebrow={page === 'home' ? now : t(area)} title={page === 'home' ? t('greeting') : t(page)} description={page === 'home' ? t('overview') : page === 'more' ? undefined : t(`${page}Body`)} action={<span className="pm-avatar" aria-hidden="true">{area === 'owner' ? 'P' : area === 'driver' ? 'M' : 'C'}</span>}/>}
      {page === 'more' ? <div className="pm-card pm-menu-list">{pages.filter(p => !primary.includes(p)).map(p => <a key={p} href={hrefFor(area, p)}><span>{t(p)}</span><ChevronRight size={18}/></a>)}</div>
      : demo && area === 'customer' && page === 'discover' ? <Suspense fallback={<p>…</p>}><CustomerDiscoverSandbox/></Suspense>
      : demo && area === 'customer' ? <Suspense fallback={<p>…</p>}><CustomerSandbox key={page} page={page}/></Suspense>
      : demo && area === 'owner' && (page === 'drivers' || page === 'vehicles') ? <CatalogSandbox page={page}/>
      : demo && area === 'owner' && page === 'bookings' ? <BookingSandbox/>
      : demo && area === 'owner' && page === 'customers' ? <CustomerCrmSandbox/>
      : demo && area === 'owner' && page === 'tours' ? <TourSandbox/>
      : demo && area === 'driver' && page === 'services' ? <DriverServicesSandbox/>
      : demo && !['calendar', 'availability', 'settings'].includes(page) ? <DemoPage key={area + page} page={page} area={area}/>
      : area === 'customer' ? <CustomerPage page={page}/>
      : page === 'home' ? <Home area={area}/>
      : page === 'calendar' || page === 'availability' ? <Suspense fallback={<p role="status">{t('calendar')}…</p>}>{demo ? <CalendarSandbox driverOnly={area === 'driver'}/> : <CalendarPage/>}</Suspense>
      : page === 'settings' ? <SettingsPage/>
      : page === 'finance' || page === 'earnings' || page === 'settlements' ? <Finance settlement={page === 'settlements'}/>
      : <Collection key={page} page={page}/>}</main></div>
    <nav className="pm-bottom-nav" aria-label={t('daily')}>{mobilePrimary.map(p => link(p, true))}{area !== 'customer' && link('more', true)}</nav>
  </div></AuthGate>;
}






