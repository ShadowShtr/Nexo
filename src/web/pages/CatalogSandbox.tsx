import { useState } from 'react';
import { Ban, CarFront, Plus, Save, UserRound, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { canCarryPassengers, isDriverPublishable, isVehiclePublishable } from '../../contracts/catalog';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';

type Driver = { id:string; name:string; english:string; phone:string; status:'active'|'inactive'; vehicles:string[] };
type Vehicle = { id:string; registration:string; make:string; model:string; capacity:number; luggage:number; notice:number; supplement:number; status:'active'|'inactive'; driverIds:string[] };
const seedDrivers:Driver[]=[{id:'d1',name:'Miguel Costa',english:'Michael Costa',phone:'+351 910 000 001',status:'active',vehicles:['v1','v2']},{id:'d2',name:'Sofia Martins',english:'Sofia Martins',phone:'+351 910 000 002',status:'active',vehicles:['v3']},{id:'d3',name:'André Ribeiro',english:'Andrew Ribeiro',phone:'+351 910 000 003',status:'inactive',vehicles:['v4']}];
const seedVehicles:Vehicle[]=[{id:'v1',registration:'00-AA-00',make:'Mercedes-Benz',model:'Classe E',capacity:4,luggage:2,notice:2,supplement:0,status:'active',driverIds:['d1']},{id:'v2',registration:'00-BB-00',make:'Mercedes-Benz',model:'Classe V',capacity:6,luggage:6,notice:48,supplement:3500,status:'active',driverIds:['d1']},{id:'v3',registration:'00-CC-00',make:'BMW',model:'Série 5',capacity:4,luggage:2,notice:2,supplement:0,status:'active',driverIds:['d2']},{id:'v4',registration:'00-DD-00',make:'Volvo',model:'XC90',capacity:6,luggage:4,notice:2,supplement:1500,status:'inactive',driverIds:['d3']}];
const money=(cents:number,locale:string)=>new Intl.NumberFormat(locale,{style:'currency',currency:'EUR'}).format(cents/100);

export function CatalogSandbox({page}:{page:'drivers'|'vehicles'}) {
  const {i18n}=useTranslation();
  const en=i18n.language==='en';
  const say=(pt:string,english:string)=>en?english:pt;
  const [drivers,setDrivers]=useState(seedDrivers);
  const [vehicles,setVehicles]=useState(seedVehicles);
  const [showForm,setShowForm]=useState(false);
  const [feedback,setFeedback]=useState('');
  const isVehicle=page==='vehicles';
  const toggleDriver=(id:string)=>{setDrivers(rows=>rows.map(row=>row.id===id?{...row,status:row.status==='active'?'inactive':'active'}:row));setFeedback(say('Estado do motorista atualizado apenas nesta demonstração.','Driver status updated in this demo only.'));};
  const toggleVehicle=(id:string)=>{setVehicles(rows=>rows.map(row=>row.id===id?{...row,status:row.status==='active'?'inactive':'active'}:row));setFeedback(say('Estado do veículo atualizado apenas nesta demonstração.','Vehicle status updated in this demo only.'));};
  const addDriver=(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);const row={displayName:String(form.get('name')||''),displayNameEn:String(form.get('english')||''),biographyPt:'Perfil de demonstração',biographyEn:'Demo profile',phone:String(form.get('phone')||''),photoPath:'demo/profile.jpg',languages:['pt-PT','en'] as ('pt-PT'|'en')[]};if(!isDriverPublishable(row)){setFeedback(say('Preencha nome, nome em inglês e telefone.','Fill in name, English name and phone.'));return;}setDrivers(rows=>[...rows,{id:`d${Date.now()}`,name:row.displayName,english:row.displayNameEn,phone:row.phone,status:'active',vehicles:[]}]);setShowForm(false);setFeedback(say('Motorista adicionado à demonstração.','Driver added to the demo.'));};
  const addVehicle=(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget);const row={registration:String(form.get('registration')||''),make:String(form.get('make')||''),model:String(form.get('model')||''),passengerCapacity:Number(form.get('capacity')),luggageCapacity:Number(form.get('luggage')),minimumNoticeHours:Number(form.get('notice')),supplementCents:Math.round(Number(form.get('supplement'))*100)};if(!isVehiclePublishable(row)){setFeedback(say('Verifique matrícula, marca, modelo e capacidade.','Check registration, make, model and capacity.'));return;}setVehicles(rows=>[...rows,{id:`v${Date.now()}`,registration:row.registration,make:row.make,model:row.model,capacity:row.passengerCapacity,luggage:row.luggageCapacity,notice:row.minimumNoticeHours,supplement:row.supplementCents,status:'active',driverIds:[]}]);setShowForm(false);setFeedback(say('Veículo adicionado à demonstração.','Vehicle added to the demo.'));};
  const toggleAssignment=(vehicleId:string,driverId:string)=>{const vehicle=vehicles.find(row=>row.id===vehicleId);if(!vehicle)return;const adding=!vehicle.driverIds.includes(driverId);setVehicles(rows=>rows.map(row=>row.id===vehicleId?{...row,driverIds:adding?[...row.driverIds,driverId]:row.driverIds.filter(id=>id!==driverId)}:row));setDrivers(rows=>rows.map(row=>row.id===driverId?{...row,vehicles:adding?[...new Set([...row.vehicles,vehicleId])]:row.vehicles.filter(id=>id!==vehicleId)}:row));setFeedback(say('Associação atualizada apenas nesta demonstração.','Assignment updated in this demo only.'));};
  const driverName=(id:string)=>drivers.find(row=>row.id===id)?.name||say('Sem motorista','Unassigned');
  const formTitle=say(isVehicle?'Novo veículo':'Novo motorista',isVehicle?'New vehicle':'New driver');
  return <>
    <div className="pm-catalog-intro">
      <div className="pm-catalog-intro-icon"><img src={isVehicle?'/owner-icon-car-front.webp':'/owner-icon-person.webp'} alt="" aria-hidden="true" /></div>
      <div><span className="pm-eyebrow">{say('Gestão da frota','Fleet management')}</span><h2>{say(isVehicle?'Veículos':'Motoristas',isVehicle?'Vehicles':'Drivers')}</h2><p>{say(isVehicle?'Registe os veículos, capacidade e disponibilidade da sua frota.':'Mantenha os motoristas e respetivos contactos organizados.','Keep vehicles and drivers organised in one place.')}</p></div>
    </div>
    <p className="pm-note pm-catalog-note">{say('Catálogo de teste · alterações apenas em memória.','Test catalogue · changes are memory-only.')}</p>
    <div className="pm-actions pm-catalog-toolbar"><Button onClick={()=>{setShowForm(value=>!value);setFeedback('');}}>{showForm?<><X size={17} aria-hidden="true" />{say('Fechar formulário','Close form')}</>:<><Plus size={17} aria-hidden="true" />{formTitle}</>}</Button><span className="pm-catalog-toolbar-hint">{say(isVehicle?'Adicione um veículo para o poder associar a motoristas e marcações.':'Adicione motoristas para os poder associar aos veículos.','Add records to use them in bookings.')}</span></div>
    {showForm&&<form className="pm-card pm-form pm-catalog-form" onSubmit={isVehicle?addVehicle:addDriver} aria-label={say('Novo registo de catálogo','New catalogue record')}>
      <div className="pm-form-heading"><div className="pm-form-heading-icon"><img src={isVehicle?'/owner-icon-car-front.webp':'/owner-icon-person.webp'} alt="" aria-hidden="true" /></div><div><span className="pm-eyebrow">{say('Novo registo','New record')}</span><h2>{formTitle}</h2><p>{say(isVehicle?'Preencha os dados principais para calcular capacidade e disponibilidade.':'Preencha os dados que serão apresentados nas marcações.','Add the details used in bookings.')}</p></div></div>
      {isVehicle?<>
        <fieldset className="pm-form-section"><legend>{say('Identificação','Identification')}</legend><div className="pm-form-grid pm-catalog-field-grid pm-catalog-field-grid-three">
          <label>{say('Matrícula','Registration')}<input name="registration" required maxLength={20} placeholder="00-AA-00" /></label>
          <label>{say('Marca','Make')}<input name="make" required maxLength={80} placeholder="Mercedes-Benz" /></label>
          <label>{say('Modelo','Model')}<input name="model" required maxLength={80} placeholder="Classe E" /></label>
        </div></fieldset>
        <fieldset className="pm-form-section"><legend>{say('Capacidade e operação','Capacity and operation')}</legend><div className="pm-form-grid pm-catalog-field-grid">
          <label>{say('Lugares de passageiros','Passenger seats')}<input name="capacity" type="number" min="1" max="20" placeholder="4" required /><small>{say('Número máximo de passageiros.','Maximum passengers.')}</small></label>
          <label>{say('Bagagem','Luggage')}<input name="luggage" type="number" min="0" max="30" defaultValue="0" placeholder="2" required /><small>{say('Malas de cabine equivalentes.','Equivalent cabin bags.')}</small></label>
          <label>{say('Antecedência (horas)','Notice (hours)')}<input name="notice" type="number" min="0" max="8760" defaultValue="2" placeholder="2" required /><small>{say('Tempo mínimo necessário antes da saída.','Minimum lead time before departure.')}</small></label>
          <label>{say('Suplemento (€)','Supplement (€)')}<input name="supplement" type="number" min="0" step="0.01" defaultValue="0" placeholder="0,00" required /><small>{say('Valor extra por utilização.','Extra amount for this vehicle.')}</small></label>
        </div></fieldset>
      </>:<>
        <fieldset className="pm-form-section"><legend>{say('Dados do motorista','Driver details')}</legend><div className="pm-form-grid pm-catalog-field-grid">
          <label>{say('Nome completo','Full name')}<input name="name" required maxLength={120} placeholder="Nome do motorista" /></label>
          <label>{say('Nome em inglês','English name')}<input name="english" required maxLength={120} placeholder="Driver name" /></label>
          <label>{say('Telefone','Phone')}<input name="phone" required minLength={7} maxLength={30} inputMode="tel" placeholder="+351 910 000 000" /></label>
        </div></fieldset>
      </>}
      <div className="pm-catalog-form-actions"><span>{say('Pode editar estes dados mais tarde no catálogo.','You can update these details later.')}</span><Button type="submit"><Save size={17} aria-hidden="true" />{say('Adicionar','Add')}</Button></div>
    </form>}
    {feedback&&<p role="status" className="pm-catalog-feedback">{feedback}</p>}
    <Section title={say(isVehicle?'Veículos publicados':'Motoristas publicados',isVehicle?'Published vehicles':'Published drivers')}>
      <div className="pm-demo-grid pm-catalog-grid">{isVehicle?vehicles.map(vehicle=><article className="pm-card pm-demo-record pm-catalog-record" key={vehicle.id}>
        <header className="pm-catalog-record-head"><div className="pm-catalog-record-icon"><img className="pm-demo-icon-art" src="/owner-icon-car-front.webp" alt="" aria-hidden="true" /></div><span className="pm-status" data-tone={vehicle.status==='active'?'positive':'neutral'}>{vehicle.status==='active'?say('ATIVO','ACTIVE'):say('INATIVO','INACTIVE')}</span></header>
        <div className="pm-catalog-record-title"><div><span className="pm-eyebrow">{say('Veículo','Vehicle')}</span><h2>{vehicle.make} {vehicle.model}</h2></div><strong>{vehicle.registration}</strong></div>
        <div className="pm-catalog-spec-grid"><div><small>{say('Lugares','Seats')}</small><strong>{vehicle.capacity}</strong><span className="pm-sr-only">{vehicle.capacity} {say('lugares de passageiros','passenger seats')}</span></div><div><small>{say('Bagagem','Luggage')}</small><strong>{vehicle.luggage}</strong></div><div><small>{say('Antecedência','Notice')}</small><strong>{vehicle.notice}h</strong></div><div><small>{say('Suplemento','Supplement')}</small><strong>{money(vehicle.supplement,i18n.language)}</strong></div></div>
        <Row label={say('Motorista','Driver')} value={vehicle.driverIds.map(driverName).join(', ')}/><Row label={say('Teste de capacidade','Capacity check')} value={canCarryPassengers(vehicle.capacity,vehicle.capacity)?say('Aceita lotação','Full capacity accepted'):say('Inválido','Invalid')}/>
        <fieldset className="pm-fieldset"><legend>{say('Motoristas associados','Assigned drivers')}</legend>{drivers.map(driver=><label key={driver.id}><input type="checkbox" aria-label={driver.name} checked={vehicle.driverIds.includes(driver.id)} onChange={()=>toggleAssignment(vehicle.id,driver.id)} />{en?driver.english:driver.name}</label>)}</fieldset>
        <Button variant="secondary" onClick={()=>toggleVehicle(vehicle.id)}>{vehicle.status==='active'?<><Ban size={17} aria-hidden="true" />{say('Desativar','Disable')}</>:<><CarFront size={17} aria-hidden="true" />{say('Ativar','Enable')}</>}</Button>
      </article>):drivers.map(driver=><article className="pm-card pm-demo-record pm-catalog-record" key={driver.id}>
        <header className="pm-catalog-record-head"><div className="pm-catalog-record-icon"><img className="pm-demo-icon-art" src="/owner-icon-person.webp" alt="" aria-hidden="true" /></div><span className="pm-status" data-tone={driver.status==='active'?'positive':'neutral'}>{driver.status==='active'?say('ATIVO','ACTIVE'):say('INATIVO','INACTIVE')}</span></header>
        <div className="pm-catalog-record-title"><div><span className="pm-eyebrow">{say('Motorista','Driver')}</span><h2>{en?driver.english:driver.name}</h2></div></div>
        <p className="pm-catalog-record-contact">{driver.phone}</p><div className="pm-catalog-record-summary"><strong>{driver.vehicles.length}</strong><span>{say('veículos associados','associated vehicles')}</span></div>
        <Button variant="secondary" onClick={()=>toggleDriver(driver.id)}>{driver.status==='active'?<><Ban size={17} aria-hidden="true" />{say('Desativar','Disable')}</>:<><UserRound size={17} aria-hidden="true" />{say('Ativar','Enable')}</>}</Button>
      </article>)}</div>
    </Section>
  </>;
}
