import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import luxonPlugin from '@fullcalendar/luxon3';
import pt from '@fullcalendar/core/locales/pt';
import enGB from '@fullcalendar/core/locales/en-gb';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { checkSchedule, requiredGapMinutes, type Allocation } from '../../domain/calendar';
import { Button } from '../../ui/components/Button';
import { demoTrips } from './DemoPage';

const drivers = ['Miguel Costa', 'Sofia Martins', 'André Ribeiro'];
const cars = ['Mercedes Classe E', 'Mercedes Classe V', 'BMW Série 5', 'Volvo XC90'];
type Entry = Allocation & { from: string; to: string };
const zone = 'Europe/Lisbon';
const toISO = (value: string) => {
  const date = DateTime.fromISO(value, { zone });
  if (!date.isValid || date.toFormat("yyyy-MM-dd'T'HH:mm") !== value || date.getPossibleOffsets().length !== 1) throw Error('TIME');
  return date.toUTC().toISO()!;
};
const initial = (): Entry[] => demoTrips.map(trip => ({id:trip.id,driverId:String(trip.driver),vehicleId:String(trip.car),startsAt:toISO(`${trip.day}T${trip.time}`),endsAt:toISO(`${trip.day}T${trip.end}`),status:'confirmed',from:trip.from,to:trip.to}));
// Deliberately memory-only. Reset/reload restores the fictional scenario.
let memory = initial();
export default function CalendarSandbox({ driverOnly = false }: { driverOnly?: boolean }) {
  const { i18n } = useTranslation();
  const say = (p:string,e:string) => i18n.language === 'en' ? e : p;
  const calendar = useRef<FullCalendar>(null);
  const [entries,setEntries] = useState(memory);
  const [filter,setFilter] = useState(driverOnly ? '0' : 'all');
  const [vehicle,setVehicle] = useState('all');
  const [draft,setDraft] = useState<Entry | null>(null);
  const [error,setError] = useState('');
  const [feedback,setFeedback] = useState('');
  const [gap,setGap] = useState(60);
  const [travel,setTravel] = useState(30);
  const [title,setTitle] = useState('');
  const [date,setDate] = useState('2026-09-11');
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(()=>{ if(draft) { formRef.current?.scrollIntoView({block:'start'}); formRef.current?.querySelector<HTMLElement>('h2')?.focus({preventScroll:true}); } },[draft?.id]);
  const margin = requiredGapMinutes(travel,{minimumGapMinutes:gap,delayAllowanceMinutes:15});
  const save = (next:Entry[]) => { memory=next;setEntries(next); };
  const visible = entries.filter(e=>(filter==='all'||e.driverId===filter)&&(vehicle==='all'||e.vehicleId===vehicle));
  const active = visible.filter(e=>e.status!=='cancelled');
  const events = active.flatMap(e=>[
    {id:e.id,title:`${e.id} · ${e.from} → ${e.to} · ${drivers[Number(e.driverId)]}`,start:e.startsAt,end:e.endsAt},
    {id:`margin-${e.id}`,title:say('Margem simulada','Simulated buffer'),start:e.endsAt,end:DateTime.fromISO(e.endsAt).plus({minutes:margin}).toISO()!,display:'background',backgroundColor:'#dddde2'},
  ]);
  const local = (value:string) => DateTime.fromISO(value).setZone(zone).toFormat("yyyy-MM-dd'T'HH:mm");
  return <div className="pm-agenda-workspace">
    <p className="pm-note">{say('Agenda de teste · 11–13 setembro 2026. Alterações apenas em memória. Sem reservas ou pagamentos reais. Relógio simulado: 10/09/2026.','Test calendar · 11–13 September 2026. Changes are memory-only. No real bookings or payments. Simulated clock: 10 September 2026.')}</p>
    <div className="pm-calendar-toolbar pm-agenda-filters">
      <label>{say('Data','Date')}<input type="date" value={date} onChange={e=>{setDate(e.target.value);if(e.target.value)calendar.current?.getApi().gotoDate(e.target.value);}}/></label>
      <label>{say('Motorista','Driver')}<select aria-label={say('Motorista','Driver')} value={filter} disabled={driverOnly} onChange={e=>setFilter(e.target.value)}><option value="all">{say('Todos','All')}</option>{drivers.map((d,i)=><option key={d} value={i}>{d}</option>)}</select></label>
      <label>{say('Veículo','Vehicle')}<select aria-label={say('Veículo','Vehicle')} value={vehicle} onChange={e=>setVehicle(e.target.value)}><option value="all">{say('Todos','All')}</option>{cars.map((d,i)=><option key={d} value={i}>{d}</option>)}</select></label>
      {!driverOnly && <Button onClick={()=>{setDraft({id:`TEST-${crypto.randomUUID().slice(0,8)}`,driverId:filter==='all'?'0':filter,vehicleId:vehicle==='all'?'0':vehicle,status:'confirmed',from:'Lisboa',to:'Cascais',startsAt:toISO(date + 'T18:00'),endsAt:toISO(date + 'T19:00')});setError('');setFeedback('');}}>{say('Nova viagem de teste','New test trip')}</Button>}
    </div>
    {!driverOnly && <details className="pm-card pm-agenda-rules"><summary>{say('Regras da simulação','Simulation rules')}</summary><label>{say('Margem mínima (min)','Minimum buffer (min)')}<input type="number" min="0" max="240" step="1" value={gap} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=0&&n<=240)setGap(n);}}/></label><label>{say('Deslocação simulada (min)','Simulated relocation (min)')}<input type="number" min="0" max="240" step="1" value={travel} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=0&&n<=240)setTravel(n);}}/></label><p>{say('Margem efetiva','Effective buffer')}: max({gap}, {travel} + 15) = {margin} min.</p><p>{say('Estimativa fictícia aplicada a todos os pares. Não calcula rotas rodoviárias; não valida horário de trabalho, antecedência comercial ou capacidade. Alterar estas regras afeta apenas novos testes e as faixas mostradas.','Fictional estimate for every pair. No road routing, working-hours, commercial lead-time or capacity validation. Changing these rules affects new tests and displayed buffers only.')}</p></details>}
    {draft && <form ref={formRef} key={draft.id} className="pm-card pm-demo-form" aria-label={say('Editar viagem de teste','Edit test trip')} onSubmit={e=>{
      e.preventDefault();setError('');
      try {
        const form=new FormData(e.currentTarget);
        const next={...draft,driverId:String(form.get('driver')),vehicleId:String(form.get('vehicle')),from:String(form.get('from')).trim(),to:String(form.get('to')).trim(),startsAt:toISO(String(form.get('start'))),endsAt:toISO(String(form.get('end')))};
        if(!next.from||!next.to) throw Error('EMPTY');
        const result=checkSchedule(next,entries,'2026-09-10T00:00:00Z',{minimumGapMinutes:gap,delayAllowanceMinutes:15},()=>travel);
        if(!result.available){setError(result.conflicts.map(c=>`${c.bookingId}: ${c.reason==='overlap'?say('sobreposição','overlap'):say('margem insuficiente','insufficient buffer')}${c.requiredMinutes?` (${c.requiredMinutes} min)`:''}`).join(' · '));return;}
        save([...entries.filter(item=>item.id!==next.id),next]);setDraft(null);setFeedback(say('Viagem de teste guardada.','Test trip saved.'));calendar.current?.getApi().gotoDate(next.startsAt);
      }catch{setError(say('Verifique as datas: fim após início e hora de Lisboa válida, sem ambiguidade.','Check dates: end after start and valid, unambiguous Lisbon time.'));}
    }}>
      <h2 tabIndex={-1}>{draft.id}</h2><p>{say('Horas de Lisboa','Lisbon time')}</p>
      <label>{say('Motorista da viagem','Trip driver')}<select name="driver" defaultValue={draft.driverId}>{drivers.map((d,i)=><option key={d} value={i}>{d}</option>)}</select></label>
      <label>{say('Carro da viagem','Trip vehicle')}<select name="vehicle" defaultValue={draft.vehicleId}>{cars.map((d,i)=><option key={d} value={i}>{d}</option>)}</select></label>
      <label>{say('Recolha','Pickup')}<input name="from" required maxLength={160} defaultValue={draft.from}/></label><label>{say('Destino','Destination')}<input name="to" required maxLength={160} defaultValue={draft.to}/></label>
      <label>{say('Início','Start')}<input name="start" type="datetime-local" required defaultValue={local(draft.startsAt)}/></label><label>{say('Fim','End')}<input name="end" type="datetime-local" required defaultValue={local(draft.endsAt)}/></label>
      {error && <p role="alert">{error}</p>}<div className="pm-actions"><Button type="submit">{say('Guardar teste','Save test')}</Button><Button type="button" variant="secondary" onClick={()=>setDraft(null)}>{say('Fechar','Close')}</Button>
      {entries.some(e=>e.id===draft.id)&&<Button type="button" variant="secondary" onClick={()=>{save(entries.map(e=>e.id===draft.id?{...e,status:'cancelled'}:e));setDraft(null);setFeedback(say('Viagem fictícia cancelada; horário libertado.','Fictional trip cancelled; slot released.'));}}>{say('Cancelar viagem de teste','Cancel test trip')}</Button>}</div>
    </form>}
    {feedback && <p role="status">{feedback}</p>}
    <div className="pm-card pm-calendar"><div className="pm-agenda-heading"><div><span className="pm-eyebrow">{say('Planeamento','Schedule')}</span><h2>{title}</h2></div><span className="pm-status" data-tone="neutral">{say('Horários de Lisboa','Lisbon time')}</span></div><FullCalendar ref={calendar} plugins={[dayGridPlugin,timeGridPlugin,listPlugin,luxonPlugin]} initialDate="2026-09-11" initialView={window.innerWidth<768?'listDay':'timeGridWeek'} locales={[pt,enGB]} locale={i18n.language==='en'?'en-gb':'pt'} timeZone={zone} firstDay={1} headerToolbar={{left:'prev,next',center:'',right:'timeGridDay,timeGridWeek,dayGridMonth,listDay'}} events={events} eventContent={info=>{const entry=entries.find(item=>item.id===info.event.id);if(!entry)return <span>{info.event.title}</span>;return <div className="pm-agenda-event" title={info.event.title}><span className="pm-agenda-event-time">{info.timeText}</span><strong>{entry.from} → {entry.to}</strong><span>{drivers[Number(entry.driverId)]}</span></div>;}} datesSet={info=>{setTitle(info.view.title);setDate(DateTime.fromJSDate(info.view.calendar.getDate()).setZone(zone).toISODate()!);}} eventClick={info=>{if(!driverOnly&&!info.event.id.startsWith('margin-')){setDraft(entries.find(e=>e.id===info.event.id)!);setError('');setFeedback('');}}} eventInteractive editable={false} allDaySlot={false} slotDuration="01:00:00" slotMinTime="06:00:00" slotMaxTime="23:00:00" height={680} scrollTime="08:00:00" eventTimeFormat={{hour:'2-digit',minute:'2-digit',hour12:false}}/></div>
    <p>{say('Cinza: margem simulada após cada serviço. A disponibilidade é verificada por motorista e carro, incluindo o serviço seguinte.','Grey: simulated buffer after each trip. Availability checks driver and car, including the next trip.')}</p>
    <p>{visible.filter(e=>e.status==='cancelled').length} {say('viagens fictícias canceladas nesta sessão','fictional trips cancelled in this session')}</p>
    {!driverOnly&&<Button variant="secondary" onClick={()=>{save(initial());setDraft(null);setFeedback(say('Cenário original reposto.','Original scenario restored.'));calendar.current?.getApi().gotoDate('2026-09-11');}}>{say('Repor dados de teste','Reset test data')}</Button>}
  </div>;
}


