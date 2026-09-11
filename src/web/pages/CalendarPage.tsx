import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import luxonPlugin from '@fullcalendar/luxon3';
import ptLocale from '@fullcalendar/core/locales/pt';
import enLocale from '@fullcalendar/core/locales/en-gb';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../ui/components/Button';
import { Row } from '../../ui/components/Primitives';
// Visual samples only. No sample is a booking and no availability is inferred here.
const SAMPLE_DATE = '2026-09-11';
export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const calendar = useRef<FullCalendar>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [sample, setSample] = useState(false);
  const [title, setTitle] = useState('');
  const [view, setView] = useState(() => window.innerWidth < 768 ? 'listDay' : 'timeGridWeek');
  const [detail, setDetail] = useState<'transfer' | 'tourExample'>('transfer');
  const [date, setDate] = useState(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
  useEffect(() => { calendar.current?.getApi().changeView(view); }, [view]);
  const events = sample ? [
    { id: 'transfer', title: `${t('transfer')} · ${t('routePreview')}`, start: `${SAMPLE_DATE}T09:00:00+01:00`, end: `${SAMPLE_DATE}T10:30:00+01:00` },
    { id: 'buffer', title: t('margin'), start: `${SAMPLE_DATE}T10:30:00+01:00`, end: `${SAMPLE_DATE}T11:30:00+01:00`, display: 'background', backgroundColor: '#dddde2' },
    { id: 'tourExample', title: `${t('tourExample')} · ${t('routeTour')}`, start: `${SAMPLE_DATE}T13:00:00+01:00`, end: `${SAMPLE_DATE}T16:00:00+01:00` },
  ] : [];
  return <><div className="pm-calendar-toolbar"><label className="pm-date-label">{t('date')}<input aria-label={t('date')} type="date" value={date} onChange={e => { setDate(e.target.value); if(e.target.value) calendar.current?.getApi().gotoDate(e.target.value); }}/></label><label className="pm-switch"><input type="checkbox" checked={sample} onChange={e => { setSample(e.target.checked); if(e.target.checked) { setDate(SAMPLE_DATE); calendar.current?.getApi().gotoDate(SAMPLE_DATE); } }}/>{t('sample')}</label></div>
    <p className="pm-note">{sample ? t('sampleNote') : t('noFleet')}</p>
    <div className="pm-card pm-calendar"><div className="pm-calendar-controls"><div className="pm-actions"><Button variant="ghost" aria-label={t('previous')} onClick={() => calendar.current?.getApi().prev()}><ChevronLeft size={18}/></Button><Button variant="ghost" onClick={() => calendar.current?.getApi().today()}>{t('today')}</Button><Button variant="ghost" aria-label={t('next')} onClick={() => calendar.current?.getApi().next()}><ChevronRight size={18}/></Button></div><strong aria-live="polite">{title}</strong><select aria-label={t('calendar')} value={view} onChange={e => setView(e.target.value)}>{[['timeGridDay', 'day'], ['timeGridWeek', 'week'], ['dayGridMonth', 'month'], ['listDay', 'list']].map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}</select></div>
    <div className="pm-calendar-scroll"><FullCalendar ref={calendar} plugins={[dayGridPlugin, timeGridPlugin, listPlugin, luxonPlugin]} initialView={view} locales={[ptLocale, enLocale]} eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }} locale={i18n.language === 'en' ? 'en-gb' : 'pt'} timeZone="Europe/Lisbon" firstDay={1} headerToolbar={false} events={events} eventContent={info => <span>{info.event.display !== 'background' && <span>{info.timeText}<br/></span>}{info.event.title}</span>} editable={false} allDaySlot={false} slotDuration="01:00:00" slotMinTime="06:00:00" slotMaxTime="23:00:00" scrollTime="08:00:00" height={590} nowIndicator eventInteractive noEventsContent={t('noEvents')} datesSet={info => { setTitle(info.view.title); const local = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit'}).format(info.view.calendar.getDate()); setDate(local); }} eventClick={info => { if(info.event.id !== 'buffer') { trigger.current = info.el; setDetail(info.event.id as 'transfer' | 'tourExample'); dialog.current?.showModal(); } }}/></div></div>
    <p className="pm-calendar-legend"><span className="pm-dot"/>{t('margin')} · {t('timezone')}</p><p className="pm-secondary pm-small">{t('calendarHint')}</p>
    <dialog ref={dialog} className="pm-dialog" aria-labelledby="sample-detail-title" onClose={() => trigger.current?.focus()}><div className="pm-section-heading"><h2 id="sample-detail-title">{t('details')}</h2><Button variant="ghost" aria-label={t('close')} onClick={() => dialog.current?.close()}><X size={20}/></Button></div><p className="pm-note">{t('sampleNote')}</p><h3>{t(detail)}</h3><Row label={t('date')} value={SAMPLE_DATE}/><Row label={t('duration')} value={detail === 'transfer' ? '90 min' : '180 min'}/><p>{t(detail === 'transfer' ? 'routePreview' : 'routeTour')}</p></dialog>
  </>;
}
