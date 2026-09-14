import { useState } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { quote, waitingCents } from '../../domain/pricing';
import { checkSchedule, type Allocation } from '../../domain/calendar';
import { checkLeadTime } from '../../domain/lead-time';
import { normalizeBookingReference } from '../../contracts/lookup';
import { Button } from '../../ui/components/Button';
import { Row } from '../../ui/components/Primitives';
import { demoTrips } from './DemoPage';
import { RouteMap } from '../components/RouteMap';
import { tourRoute, transferRoutes } from '../demo-routes';

const drivers = ['Miguel Costa','Sofia Martins','André Ribeiro'];
const cars = [
  {name:'Mercedes-Benz Classe E',driver:0,capacity:4},
  {name:'Mercedes-Benz Classe V',driver:0,capacity:6},
  {name:'BMW Série 5',driver:1,capacity:4},
  {name:'Volvo XC90',driver:2,capacity:6},
];
const clock = '2026-09-10T08:00:00Z';
type Request = {id:string; allocation:Allocation; driver:number; car:number; route:string; people:number; name:string; total:number; deposit:number; balance:number; cancelled:boolean};
let requests:Request[]=[];
const seed:Allocation[]=demoTrips.map(trip=>({id:trip.id,driverId:String(trip.driver),vehicleId:String(trip.car),startsAt:`${trip.day}T${trip.time}:00+01:00`,endsAt:`${trip.day}T${trip.end}:00+01:00`,status:'confirmed'}));
export default function CustomerSandbox({ page }: {page:string}) {
  const { i18n }=useTranslation();
  const say=(pt:string,en:string)=>i18n.language==='en'?en:pt;
  const money=(n:number)=>new Intl.NumberFormat(i18n.language,{style:'currency',currency:'EUR'}).format(n/100);
  const [step,setStep]=useState(1);
  const [driver,setDriver]=useState(0);
  const [car,setCar]=useState(0);
  const [service,setService]=useState<'transfer'|'tour'>('transfer');
  const [route,setRoute]=useState(0);
  const [people,setPeople]=useState(2);
  const [start,setStart]=useState('2026-09-14T10:00');
  const [wait,setWait]=useState(0);
  const [name,setName]=useState('Ana Exemplo');
  const [email,setEmail]=useState('cliente@example.invalid');
  const [error,setError]=useState('');
  const [current,setCurrent]=useState<Request|null>(null);
  const [lookupCode,setLookupCode]=useState('');
  const [lookupResult,setLookupResult]=useState<Request|null>(null);
  const [lookupError,setLookupError]=useState('');
  const [history,setHistory]=useState(requests);
  const selectedRoute=service==='tour'?tourRoute:transferRoutes[route];
  const price=quote({passengers:people,passengerCapacity:cars[car].capacity,service:service==='tour'?{kind:'tour',baseCents:20000,extraPassengerCents:3500}:{kind:'transfer',baseCents:1000,distanceMeters:transferRoutes[route].meters,centsPerKm:200},extras:[{code:'waiting',cents:waitingCents(wait,0,15,2400)}]});
  const validate=():Allocation|null=>{
    setError('');
    const date=DateTime.fromISO(start,{zone:'Europe/Lisbon'});
    if(!date.isValid||date.toFormat("yyyy-MM-dd'T'HH:mm")!==start||date.getPossibleOffsets().length!==1){setError(say('Escolha uma hora de Lisboa válida e sem ambiguidade.','Choose a valid, unambiguous Lisbon time.'));return null;}
    const lead=checkLeadTime(clock,date.toUTC().toISO()!,service);
    if(!lead.eligible){setError(say(`Antecedência mínima: ${lead.requiredMinutes/60} horas desde o relógio de teste.`,`Minimum notice: ${lead.requiredMinutes/60} hours from the test clock.`));return null;}
    const candidate:Allocation={id:`CLIENT-${crypto.randomUUID().slice(0,8)}`,driverId:String(driver),vehicleId:String(car),startsAt:date.toUTC().toISO()!,endsAt:date.plus({minutes:selectedRoute.minutes+wait}).toUTC().toISO()!,status:'requested',holdExpiresAt:DateTime.fromISO(clock).plus({minutes:30}).toISO()!};
    const result=checkSchedule(candidate,[...seed,...requests.map(r=>r.allocation)],clock,{minimumGapMinutes:60,delayAllowanceMinutes:15},()=>30);
    if(!result.available){setError(say('Horário indisponível para este motorista ou carro. Escolha outra hora ou motorista.','Time unavailable for this driver or car. Choose another time or driver.'));return null;}
    return candidate;
  };
  const record=(r:Request)=><article className="pm-card pm-demo-record" key={r.id}><h2>{r.id}</h2><p role="status">{r.cancelled?say('Pedido de teste cancelado','Test request cancelled'):say('A aguardar aceitação do motorista','Awaiting driver acceptance')}</p><p>{r.route}</p><p>{DateTime.fromISO(r.allocation.startsAt).setZone('Europe/Lisbon').toFormat('dd/MM/yyyy HH:mm')} · {drivers[r.driver]} · {cars[r.car].name}</p><Row label={say('Passageiros','Passengers')} value={r.people}/><Row label={say('Total','Total')} value={money(r.total)}/><Row label={say('Sinal após aceitação · 25%','Deposit after acceptance · 25%')} value={money(r.deposit)}/><Row label={say('Saldo no início','Balance at pickup')} value={money(r.balance)}/><p>{say('Ainda não foi pago qualquer valor. O sinal só será pedido depois do aceite do motorista.','Nothing has been paid. The deposit is requested only after driver acceptance.')}</p>{!r.cancelled&&<Button variant="secondary" onClick={()=>{const next={...r,cancelled:true,allocation:{...r.allocation,status:'cancelled' as const}};requests=requests.map(item=>item.id===r.id?next:item);setHistory([...requests]);if(current?.id===r.id)setCurrent(next);if(lookupResult?.id===r.id)setLookupResult(next);}}>{say('Cancelar pedido de teste','Cancel test request')}</Button>}</article>;
  return <>
    <p className="pm-note">{say('Experiência de cliente — dados fictícios. Relógio de teste: 10/09/2026, 09:00 Lisboa. Distâncias e preços de exemplo; não existe cobrança.','Customer experience — fictional data. Test clock: 10 September 2026, 09:00 Lisbon. Example distances and prices; no charges.')}</p>
    {page==='lookup'?<><form className="pm-card pm-demo-form" aria-label={say('Consultar reserva','Find booking')} onSubmit={event=>{event.preventDefault();const normalized=normalizeBookingReference(lookupCode);const found=normalized?history.find(item=>item.id===normalized):null;if(!found){setLookupError(say('Código não encontrado nesta sessão de teste.','Code not found in this test session.'));setLookupResult(null);return;}setLookupError('');setLookupResult(found);}}><label>{say('Código de confirmação','Confirmation code')}<input value={lookupCode} onChange={event=>setLookupCode(event.target.value)} placeholder="CLIENT-XXXXXXXX" autoComplete="off"/></label>{lookupError&&<p role="alert">{lookupError}</p>}<div className="pm-actions"><Button type="submit">{say('Consultar','Look up')}</Button>{lookupResult&&<Button type="button" variant="secondary" onClick={()=>{setLookupResult(null);setLookupCode('');setLookupError('');}}>{say('Limpar consulta','Clear lookup')}</Button>}</div></form>{lookupResult&&<><RouteMap route={selectedRoute} language={i18n.language==='en'?'en':'pt'}/>{record(lookupResult)}</>}<h2>{say('Os meus pedidos de teste','My test requests')}</h2>{history.length?history.map(record):<p>{say('Ainda não criou pedidos nesta sessão.','No requests created in this session yet.')}</p>}<Button asChild><a href="#/customer/booking">{say('Marcar viagem','Book a trip')}</a></Button></>:current?<><RouteMap route={selectedRoute} language={i18n.language==='en'?'en':'pt'}/>{record(current)}<Button asChild><a href="#/customer/lookup">{say('Consultar pedidos','View requests')}</a></Button></>:<>
    <p>{say('Passo','Step')} {step}/4 · {['',say('Motorista e carro','Driver and car'),say('A sua viagem','Your trip'),say('Os seus dados','Your details'),say('Rever pedido','Review request')][step]}</p>
    <form className="pm-card pm-demo-form" onSubmit={event=>{event.preventDefault();if(step===2&&!validate())return;if(step===4){const allocation=validate();if(!allocation)return;const r:Request={id:allocation.id,allocation,driver,car,route:selectedRoute.name,people,name,total:price.totalCents,deposit:price.depositCents,balance:price.balanceCents,cancelled:false};requests=[...requests,r];setHistory(requests);setCurrent(r);return;}setError('');setStep(step+1);}}>
    {step===1&&<><h2>{say('Escolha o seu motorista','Choose your driver')}</h2><div className="pm-demo-grid">{drivers.map((d,index)=><button className="pm-card pm-demo-record" type="button" key={d} aria-pressed={driver===index} onClick={()=>{setDriver(index);setCar(cars.findIndex(c=>c.driver===index));setPeople(2);}}><strong>{d}</strong><p>{say('Português / Inglês · Perfil fictício','Portuguese / English · Fictional profile')}</p>{driver===index&&<span>✓ {say('Selecionado','Selected')}</span>}</button>)}</div><label>{say('Carro','Car')}<select aria-label={say('Carro','Car')} value={car} onChange={e=>{setCar(Number(e.target.value));setPeople(2);}}>{cars.map((c,index)=>c.driver===driver&&<option value={index} key={c.name}>{c.name} · {c.capacity} {say('passageiros','passengers')}</option>)}</select></label></>}
    {step===2&&<><label>{say('Serviço','Service')}<select aria-label={say('Serviço','Service')} value={service} onChange={e=>setService(e.target.value as 'transfer'|'tour')}><option value="transfer">Transfer</option><option value="tour">Tour · Sintra / Cabo da Roca</option></select></label>{service==='transfer'?<label>{say('Percurso de teste','Test route')}<select aria-label={say('Percurso de teste','Test route')} value={route} onChange={e=>setRoute(Number(e.target.value))}>{transferRoutes.map((r,index)=><option key={r.name} value={index}>{r.name}</option>)}</select></label>:<p>{say('Tour de 4h: 200 € até 2 pessoas; +35 € por pessoa adicional. Antecedência: 48h.','4h tour: €200 up to 2 people; +€35 per additional person. Minimum notice: 48h.')}</p>}<RouteMap route={selectedRoute} language={i18n.language==='en'?'en':'pt'}/><label>{say('Data e hora de recolha','Pickup date and time')}<input type="datetime-local" required value={start} onChange={e=>setStart(e.target.value)}/></label><label>{say('Passageiros','Passengers')}<select aria-label={say('Passageiros','Passengers')} value={people} onChange={e=>setPeople(Number(e.target.value))}>{Array.from({length:cars[car].capacity},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label><label>{say('Espera adicional','Additional waiting')}<select aria-label={say('Espera adicional','Additional waiting')} value={wait} onChange={e=>setWait(Number(e.target.value))}>{[0,15,30,60].map(n=><option key={n} value={n}>{n} min</option>)}</select></label><p>{say('Valores fictícios: transfer 10 € + 2 €/km; espera 24 €/h. A duração e a distância são estimativas de teste.','Fictional prices: transfer €10 + €2/km; waiting €24/hour. Duration and distance are test estimates.')}</p></>}
    {step===3&&<><label>{say('Nome completo','Full name')}<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><p>{say('Use dados fictícios. Telefone, NIF e faturação serão integrados no fluxo real. Nada é enviado.','Use fictional details. Phone, tax ID and invoicing will be integrated into the real flow. Nothing is sent.')}</p></>}
    {step===4&&<><h2>{say('Rever pedido','Review request')}</h2><RouteMap route={selectedRoute} language={i18n.language==='en'?'en':'pt'}/><p>{name} · {email}</p><p>{drivers[driver]} · {cars[car].name}</p><p>{selectedRoute.name} · {start.replace('T',' ')}</p><Row label={say('Passageiros','Passengers')} value={people}/><Row label={say('Base','Base')} value={money(service==='tour'?20000:1000)}/><Row label={service==='tour'?say('Pessoas adicionais','Additional people'):say('Distância fictícia','Fictional distance')} value={money(price.lines[1].cents)}/><Row label={say('Espera','Waiting')} value={money(waitingCents(wait,0,15,2400))}/><p>{say('Este pedido aguarda aceitação do motorista antes do pagamento.','This request requires driver acceptance before payment.')}</p></>}
    {step>1&&<div className="pm-summary"><Row label={say('Total de teste','Test total')} value={money(price.totalCents)}/><Row label={say('Sinal · 25%','Deposit · 25%')} value={money(price.depositCents)}/><Row label={say('Saldo · 75%','Balance · 75%')} value={money(price.balanceCents)}/></div>}
    {error&&<p role="alert">{error}</p>}<div className="pm-actions">{step>1&&<Button type="button" variant="secondary" onClick={()=>{setStep(step-1);setError('');}}>{say('Voltar','Back')}</Button>}<Button type="submit">{step===4?say('Enviar pedido de teste','Submit test request'):say('Continuar','Continue')}</Button></div></form>
    </>}
  </>;
}

