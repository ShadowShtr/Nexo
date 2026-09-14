import { useState } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { transition, type BookingStatus } from '../../domain/booking';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';
import { wazeHref } from '../demo-routes';
import { demoTrips } from './DemoPage';

type Service=typeof demoTrips[number]&{status:BookingStatus};
const next:Partial<Record<BookingStatus,BookingStatus>>={confirmed:'en_route',en_route:'arrived',arrived:'in_progress',in_progress:'completed'};
export function DriverServicesSandbox(){
  const {i18n}=useTranslation();const en=i18n.language==='en';const say=(pt:string,english:string)=>en?english:pt;const [services,setServices]=useState<Service[]>(demoTrips.filter(trip=>trip.driver===0).map(trip=>({...trip,status:'confirmed' as BookingStatus})));const statusLabel=(status:BookingStatus)=>({confirmed:say('Confirmado','Confirmed'),en_route:say('A caminho','En route'),arrived:say('No local','Arrived'),in_progress:say('Em viagem','In progress'),completed:say('Concluído','Completed')} as Partial<Record<BookingStatus,string>>)[status]||status;const actionLabel=(status:BookingStatus)=>({confirmed:say('Marcar a caminho','Mark en route'),en_route:say('Marcar chegada','Mark arrived'),arrived:say('Iniciar viagem','Start trip'),in_progress:say('Concluir serviço','Complete service')} as Partial<Record<BookingStatus,string>>)[status];
  const advance=(id:string)=>setServices(rows=>rows.map(service=>{if(service.id!==id||!next[service.status])return service;return {...service,status:transition(service.status,next[service.status]!)}}));
  return <><p className="pm-note">{say('Serviços de teste do motorista · estados locais, sem notificações ou recebimentos reais.','Driver test services · local states, with no real notifications or receipts.')}</p><Section title={say('Meus serviços','My services')}><div className="pm-demo-grid">{services.map(service=><article className="pm-card pm-demo-record" key={service.id}><div className="pm-section-heading"><span className="pm-status" data-tone={service.status==='completed'?'positive':'neutral'}>{statusLabel(service.status)}</span><span className="pm-secondary">{service.id}</span></div><h2>{service.from} → {service.to}</h2><p>{DateTime.fromISO(`${service.day}T${service.time}:00`,{zone:'Europe/Lisbon'}).toFormat('dd/MM/yyyy HH:mm')} · {service.passengers} {say('passageiros','passengers')}</p><Row label={say('Cliente','Customer')} value={['Ana Exemplo','Daniel Exemplo','Emma Example','Tom Example'][service.customer]||'Cliente'}/><a className="pm-button pm-button-primary" href={wazeHref(service.destination)} target="_blank" rel="noreferrer">{say('Abrir destino no Waze','Open destination in Waze')}</a>{next[service.status]&&<Button variant="secondary" onClick={()=>advance(service.id)}>{actionLabel(service.status)}</Button>}</article>)}</div></Section></>;
}
