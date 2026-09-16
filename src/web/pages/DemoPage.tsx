import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CarFront, MapPin, UserRound } from 'lucide-react';
import { Row, Section } from '../../ui/components/Primitives';
import type { Area } from '../navigation';
import { wazeHref } from '../demo-routes';
import { TourSimulator } from './TourSimulator';

const drivers = ['Miguel Costa', 'Sofia Martins', 'André Ribeiro'];
const cars = [
  ['Mercedes-Benz Classe E', 'Miguel Costa', 4],
  ['Mercedes-Benz Classe V', 'Miguel Costa', 6],
  ['BMW Série 5', 'Sofia Martins', 4],
  ['Volvo XC90', 'André Ribeiro', 6],
] as const;
const customers = ['Ana Exemplo', 'Daniel Exemplo', 'Emma Example', 'Tom Example', 'Carla Exemplo', 'James Example'];
const ownerPageIcons: Record<string, string> = {
  customers: '/owner-icon-person.png',
  drivers: '/owner-icon-person.png',
  vehicles: '/owner-icon-car-front.png',
  tours: '/owner-icon-tours.png',
  finance: '/owner-icon-wallet.png',
  settlements: '/owner-icon-card.png',
};
export const demoTrips = [
  { id: 'TEST-001', day: '2026-09-11', time: '09:00', end: '10:30', from: 'Aeroporto de Lisboa', to: 'Cascais', destination: [38.6979,-9.4215] as const, driver: 0, car: 0, customer: 0, cents: 12000, passengers: 2 },
  { id: 'TEST-002', day: '2026-09-11', time: '13:00', end: '17:00', from: 'Lisboa', to: 'Sintra · Cabo da Roca', destination: [38.7804,-9.4989] as const, driver: 0, car: 1, customer: 1, cents: 27000, passengers: 4 },
  { id: 'TEST-003', day: '2026-09-12', time: '10:00', end: '11:30', from: 'Parque das Nações', to: 'Setúbal', destination: [38.5244,-8.8882] as const, driver: 1, car: 2, customer: 2, cents: 15000, passengers: 2 },
  { id: 'TEST-004', day: '2026-09-12', time: '14:00', end: '18:00', from: 'Lisboa', to: 'Arrábida · Azeitão', destination: [38.519,-9.014] as const, driver: 2, car: 3, customer: 3, cents: 30500, passengers: 5 },
  { id: 'TEST-005', day: '2026-09-13', time: '08:00', end: '09:30', from: 'Estoril', to: 'Aeroporto de Lisboa', destination: [38.7742,-9.1342] as const, driver: 0, car: 0, customer: 4, cents: 12000, passengers: 2 },
  { id: 'TEST-006', day: '2026-09-13', time: '11:00', end: '15:00', from: 'Lisboa', to: 'Óbidos', destination: [39.3606,-9.1567] as const, driver: 1, car: 2, customer: 5, cents: 23500, passengers: 3 },
];

type DemoRecord = { title: string; detail: string; meta: string; value: string; waze?: string };

export function DemoPage({ page, area }: { page: string; area: Area }) {
  const { i18n } = useTranslation();
  const en = i18n.language === 'en';
  const [search, setSearch] = useState('');
  const label = (pt: string, english: string) => en ? english : pt;
  const money = (cents: number) => new Intl.NumberFormat(i18n.language, {style:'currency',currency:'EUR'}).format(cents / 100);
  const trips = area === 'driver' ? demoTrips.filter(trip => trip.driver === 0) : demoTrips;
  const tripCards: DemoRecord[] = trips.map(trip => ({
    title: `${trip.from} → ${trip.to}`,
    detail: `${trip.day} · ${trip.time}–${trip.end} · ${drivers[trip.driver]}`,
    meta: `${trip.id} · ${customers[trip.customer]} · ${cars[trip.car][0]} · ${trip.passengers} ${label('passageiros','passengers')}`,
    value: money(trip.cents),
    waze: area === 'driver' && page === 'services' ? wazeHref(trip.destination) : undefined,
  }));
  let records: DemoRecord[] = tripCards;
  if (['drivers','discover','booking','profile'].includes(page)) records = drivers.filter((_,index) => page !== 'profile' || index === 0).map(name => ({title:name,detail:cars.filter(car=>car[1] === name).map(car=>car[0]).join(' · '),meta:label('Lisboa, Cascais e Sintra · Português / Inglês','Lisbon, Cascais and Sintra · Portuguese / English'),value:label('Perfil fictício','Fictional profile')}));
  if (page === 'vehicles') records = cars.map(car=>({title:car[0],detail:car[1],meta:`${car[2]} ${label('passageiros, excluindo motorista','passengers, excluding driver')}`,value:label('Veículo de teste','Test vehicle')}));
  if (page === 'customers') records = customers.map((name,index)=>({title:name,detail:`cliente${index+1}@example.invalid`,meta:label('Contacto e NIF não preenchidos · Dados fictícios','Contact and tax ID not supplied · Fictional data'),value:label('Cliente de teste','Test customer')}));
  if (page === 'tours') records = ['Sintra · Cabo da Roca','Arrábida · Azeitão','Óbidos'].map(name=>({title:name,detail:label('4 horas · Até 2 pessoas · +35 € por pessoa adicional','4 hours · Up to 2 people · +€35 per additional person'),meta:label('Antecedência mínima: 48 horas · Preço ilustrativo','Minimum notice: 48 hours · Illustrative price'),value:money(20000)}));
  if (page === 'settlements') records = drivers.map((name,index)=>({title:name,detail:label('Acerto pessoal · Nenhuma transferência efetuada','In-person settlement · No transfer made'),meta:label('Exemplo de valor X, não acordado','Example X amount, not agreed'),value:money(index === 0 ? 0 : 2000)}));
  const filtered = records.filter(record=>Object.values(record).join(' ').toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <>
    <p className="pm-note">{label('Demonstração: 11–13 setembro 2026. Pessoas e serviços fictícios; locais reais. Valores ilustrativos, sem pagamentos ou disponibilidade confirmados.','Demo: 11–13 September 2026. Fictional people and services; real places. Illustrative prices, with no confirmed payments or availability.')}</p>
    {page === 'home' && <section className="pm-summary pm-hero"><span className="pm-eyebrow">{label('Serviço de exemplo','Sample service')}</span><h2>Aeroporto de Lisboa → Cascais</h2><p>11/09/2026 · 09:00 · Miguel Costa</p><p>Mercedes-Benz Classe E · 2 {label('passageiros','passengers')}</p><strong>{money(12000)}</strong></section>}
    {['finance','earnings'].includes(page) && <section className="pm-summary"><span>{label('Total dos orçamentos fictícios','Total fictional quotes')}</span><p className="pm-value">{money(trips.reduce((sum,trip)=>sum+trip.cents,0))}</p><p>{label('Não representa dinheiro recebido.','This does not represent money received.')}</p></section>}
    <Section title={label('Dados de teste','Test data')}><label className="pm-search"><span className="pm-sr-only">{label('Pesquisar dados de teste','Search test data')}</span><input type="search" aria-label={label('Pesquisar dados de teste','Search test data')} placeholder={label('Pesquisar…','Search…')} value={search} onChange={event=>setSearch(event.target.value)}/></label>
      <div className="pm-demo-grid">{filtered.map(record=><article className="pm-card pm-demo-record" key={record.title}><div className="pm-section-heading">{area === 'owner' && ownerPageIcons[page] ? <img className="pm-demo-icon-art" src={ownerPageIcons[page]} alt="" aria-hidden="true"/> : page === 'vehicles' ? <CarFront aria-hidden/> : ['drivers','customers','profile'].includes(page) ? <UserRound aria-hidden/> : <MapPin aria-hidden/>}<span className="pm-status" data-tone="neutral">TEST</span></div><h2>{record.title}</h2><p>{record.detail}</p><p className="pm-secondary">{record.meta}</p><Row label={label('Exemplo','Example')} value={record.value}/>{record.waze&&<a className="pm-button pm-button-primary" href={record.waze} target="_blank" rel="noreferrer">{label('Abrir destino no Waze','Open destination in Waze')}</a>}</article>)}</div>
      {!filtered.length && <p role="status">{label('Sem resultados.','No results.')}</p>}
    </Section>
    {page === 'tours' && <TourSimulator/>}
  </>;
}
