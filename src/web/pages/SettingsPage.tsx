import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Calculator, RotateCcw } from 'lucide-react';
import { quote, waitingCents } from '../../domain/pricing';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';
import { readDemoTariff, saveDemoTariff } from '../demo-config';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState<number | null>(null);
  const [price, setPrice] = useState<{ totalCents:number; depositCents:number; balanceCents:number; lines:{code:string;cents:number}[] } | null>(null);
  const [priceError, setPriceError] = useState('');
  const [saveFeedback, setSaveFeedback] = useState('');
  const [pricingService, setPricingService] = useState<'transfer'|'tour'>('transfer');
  const minutes = z.number().int(t('validMinutes')).min(0, t('validMinutes')).max(1440, t('validMinutes'));
  const schema = z.object({ minimum: minutes, tolerance: minutes, travel: minutes });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { minimum: 60, tolerance: 15, travel: 20 } });
  const label = (pt:string, en:string) => i18n.language === 'en' ? en : pt;
  const money = (cents:number) => new Intl.NumberFormat(i18n.language, { style:'currency', currency:'EUR' }).format(cents / 100);
  const pricingLineLabel = (code:string) => ({ base: label('Preço do pacote', 'Package price'), distance: label('Custo da distância', 'Distance cost'), night: label('Suplemento noturno', 'Night surcharge'), 'extra:waiting': label('Espera', 'Waiting'), extra_passengers: label('Pessoas adicionais', 'Additional passengers') }[code] ?? code);
  const simulatePrice = (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPriceError('');
    try {
      const form = new FormData(event.currentTarget);
      const service = String(form.get('service')) as 'transfer'|'tour';
      const passengers = Number(form.get('passengers'));
      const baseCents = service === 'tour' ? Math.round(Number(form.get('base')) * 100) : 0;
      const result = service === 'tour'
        ? quote({ passengers, passengerCapacity: 6, service: { kind:'tour', baseCents, extraPassengerCents: Math.round(Number(form.get('extra')) * 100) }, extras: [{ code:'waiting', cents: waitingCents(Number(form.get('waiting')), 0, 15, Math.round(Number(form.get('hourly')) * 100)) }] })
        : quote({ passengers, passengerCapacity: 6, service: { kind:'transfer', distanceMeters: Math.round(Number(form.get('distance')) * 1000), centsPerKm: Math.round(Number(form.get('perKm')) * 100) }, nightSurchargeBps: Math.round(Number(form.get('night')) * 100), extras: [{ code:'waiting', cents: waitingCents(Number(form.get('waiting')), 0, 15, Math.round(Number(form.get('hourly')) * 100)) }] });
      setPrice(result);
    } catch { setPrice(null); setPriceError(label('Verifique os valores do simulador.','Check the simulator values.')); }
  };
  const saveTariff = (form: HTMLFormElement) => {
    const values = new FormData(form);
    const service = String(values.get('service')) as 'transfer' | 'tour';
    const number = (name: string) => Number(values.get(name));
    const baseCents = service === 'tour' ? Math.round(number('base') * 100) : 0;
    const extraCents = service === 'tour' ? Math.round(number('extra') * 100) : 0;
    const perKmCents = Math.round(number('perKm') * 100);
    const waitingCents = Math.round(number('hourly') * 100);
    const nightBps = Math.round(number('night') * 100);
    const valuesToCheck = service === 'tour' ? [baseCents, extraCents, waitingCents, nightBps] : [perKmCents, waitingCents, nightBps];
    if (!valuesToCheck.every(value => Number.isFinite(value) && value >= 0)) { setSaveFeedback(label('Verifique os valores antes de guardar.','Check the values before saving.')); return; }
    const current = readDemoTariff();
    saveDemoTariff({ ...current, ...(service === 'tour' ? { tourBaseCents: baseCents, tourExtraPassengerCents: extraCents } : { transferCentsPerKm: perKmCents }), waitingCentsPerHour: waitingCents, nightSurchargeBps: nightBps });
    setSaveFeedback(label('Tarifa guardada para esta demonstração.','Tariff saved for this demo.'));
    setPriceError('');
  };
  const configured = readDemoTariff();
  return <>
    <div className="pm-settings-top-grid">
      <Section title={t('rules')}>
        <form className="pm-card pm-form pm-rules-form" onSubmit={handleSubmit(v => setResult(Math.max(v.minimum, v.travel + v.tolerance)))} onChange={() => setResult(null)} noValidate>
          <div className="pm-form-heading"><div className="pm-form-heading-icon"><img src="/owner-icon-calendar.png" alt="" aria-hidden="true" /></div><div><span className="pm-eyebrow">{label('Agenda','Schedule')}</span><h3>{t('rules')}</h3><p>{t('simulationNote')}</p></div></div>
          <div className="pm-settings-field-grid">{(['minimum', 'tolerance', 'travel'] as const).map((key, index) => <div className="pm-field pm-settings-field" key={key}><label htmlFor={key}>{t(['minGap', 'tolerance', 'relocation'][index])}</label><input id={key} type="number" min="0" max="1440" step="1" {...register(key, { valueAsNumber: true })} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />{errors[key] && <p className="pm-error" id={`${key}-error`}>{t('validMinutes')}</p>}</div>)}</div>
          <div className="pm-actions"><Button type="submit"><Calculator size={17} aria-hidden="true" />{t('simulate')}</Button><Button variant="ghost" onClick={() => { reset(); setResult(null); }}><RotateCcw size={17} aria-hidden="true" />{t('reset')}</Button></div>
          <output className="pm-simulation-result" aria-live="polite">{result !== null && <>{t('result')}: <strong>{result} {t('minutes')}</strong></>}</output>
        </form>
      </Section>
      <Section title={t('policies')}>
        <div className="pm-card pm-group pm-policy-card"><div className="pm-policy-heading"><div className="pm-form-heading-icon"><img src="/owner-icon-card.png" alt="" aria-hidden="true" /></div><div><span className="pm-eyebrow">{label('Regras atuais','Current rules')}</span><p>{label('Aplicadas a novas marcações.','Applied to new bookings.')}</p></div></div><Row label={t('deposit')} value="25%"/><Row label={t('balance')} value="75%"/><Row label={t('cancellation')} value={t('cancellationValue')}/><Row label={t('leadTime')} value={t('leadTimeValue')}/><Row label={t('accept')} value={t('acceptValue')}/></div>
      </Section>
    </div>
    <Section title={label('Simulador e configuração de preço','Price simulator and configuration')}>
      <form className="pm-card pm-form pm-price-form" aria-label={label('Simulador de preço','Price simulator')} onSubmit={simulatePrice}>
        <div className="pm-form-heading"><div className="pm-form-heading-icon"><img src="/owner-icon-wallet.png" alt="" aria-hidden="true" /></div><div><span className="pm-eyebrow">{label('Tarifas','Pricing')}</span><h3>{label('Simule antes de publicar','Simulate before publishing')}</h3><p>{label('Ajuste os valores e veja imediatamente o total, sinal e saldo.','Adjust values and preview the total, deposit and balance.')}</p></div></div>
        <div className="pm-price-field-grid pm-form-grid">
          <label className="pm-form-field-wide">{label('Serviço','Service')}<select name="service" value={pricingService} onChange={event=>{setPricingService(event.target.value as 'transfer'|'tour');setPrice(null);setPriceError('');setSaveFeedback('');}}><option value="transfer">Transfer</option><option value="tour">Tour</option></select></label>
          <div className="pm-pricing-mode-note pm-form-field-wide"><strong>{pricingService === 'transfer' ? label('Regra do transfer','Transfer rule') : label('Regra do tour','Tour rule')}</strong><span>{pricingService === 'transfer' ? label('Total = distância da rota × preço por km.','Total = route distance × price per km.') : label('Total = preço do pacote + pessoas adicionais.','Total = package price + additional passengers.')}</span></div>
          <label>{label('Passageiros','Passengers')}<input name="passengers" type="number" min="1" max="6" defaultValue="2" required /></label>
          {pricingService === 'transfer' ? <><label>{label('Distância da rota (km)','Route distance (km)')}<input name="distance" type="number" min="0" step="0.1" defaultValue="35" required /></label><label>{label('Preço por km (€)','Price per km (€)')}<input name="perKm" type="number" min="0" step="0.01" defaultValue={(configured.transferCentsPerKm / 100).toFixed(2)} required /></label></> : <><label>{label('Preço do pacote (€)','Package price (€)')}<input name="base" type="number" min="0" step="0.01" defaultValue={(configured.tourBaseCents / 100).toFixed(2)} required /></label><label>{label('Adicional por pessoa (€)','Additional passenger (€)')}<input name="extra" type="number" min="0" step="0.01" defaultValue={(configured.tourExtraPassengerCents / 100).toFixed(2)} required /></label></>}
          <label>{label('Suplemento noturno (%)','Night surcharge (%)')}<input name="night" type="number" min="0" max="100" step="0.01" defaultValue={(configured.nightSurchargeBps / 100).toFixed(2)} required /></label>
          <label>{label('Espera (min)','Waiting (min)')}<input name="waiting" type="number" min="0" max="1440" step="1" defaultValue="0" required /></label>
          <label>{label('Preço de espera/hora (€)','Waiting price/hour (€)')}<input name="hourly" type="number" min="0" step="0.01" defaultValue={(configured.waitingCentsPerHour / 100).toFixed(2)} required /></label>
        </div>
        <div className="pm-price-form-footer"><p>{label('A tarifa guardada é usada no fluxo de demonstração do cliente.','The saved tariff is used by the customer demo flow.')}</p><div className="pm-actions"><Button type="submit"><Calculator size={17} aria-hidden="true" />{label('Simular preço','Simulate price')}</Button><Button type="button" variant="secondary" onClick={event=>{const form=event.currentTarget.form;if(form)saveTariff(form);}}><RotateCcw size={17} aria-hidden="true" />{label('Guardar tarifa','Save tariff')}</Button></div></div>
        {saveFeedback&&<p role="status" className="pm-settings-feedback">{saveFeedback}</p>}{priceError&&<p role="alert" className="pm-settings-feedback pm-settings-feedback-error">{priceError}</p>}
        {price&&<div className="pm-card pm-group pm-price-result" aria-live="polite"><div className="pm-price-result-heading"><span className="pm-eyebrow">{label('Resultado da simulação','Simulation result')}</span><strong>{money(price.totalCents)}</strong></div><Row label={label('Sinal · 25%','Deposit · 25%')} value={money(price.depositCents)}/><Row label={label('Saldo · 75%','Balance · 75%')} value={money(price.balanceCents)}/>{price.lines.filter(line=>line.cents>0).map(line=><Row key={line.code} label={pricingLineLabel(line.code)} value={money(line.cents)}/>)}</div>}
      </form>
    </Section>
  </>;
}
