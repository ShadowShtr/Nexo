import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Calculator, RotateCcw } from 'lucide-react';
import { quote, waitingCents } from '../../domain/pricing';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState<number | null>(null);
  const [price, setPrice] = useState<{ totalCents:number; depositCents:number; balanceCents:number; lines:{code:string;cents:number}[] } | null>(null);
  const [priceError, setPriceError] = useState('');
  const minutes = z.number().int(t('validMinutes')).min(0, t('validMinutes')).max(1440, t('validMinutes'));
  const schema = z.object({ minimum: minutes, tolerance: minutes, travel: minutes });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { minimum: 60, tolerance: 15, travel: 20 } });
  const label = (pt:string, en:string) => i18n.language === 'en' ? en : pt;
  const money = (cents:number) => new Intl.NumberFormat(i18n.language, { style:'currency', currency:'EUR' }).format(cents / 100);
  const simulatePrice = (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPriceError('');
    try {
      const form = new FormData(event.currentTarget);
      const service = String(form.get('service')) as 'transfer'|'tour';
      const passengers = Number(form.get('passengers'));
      const baseCents = Math.round(Number(form.get('base')) * 100);
      const result = service === 'tour'
        ? quote({ passengers, passengerCapacity: 6, service: { kind:'tour', baseCents, extraPassengerCents: Math.round(Number(form.get('extra')) * 100) }, extras: [{ code:'waiting', cents: waitingCents(Number(form.get('waiting')), 0, 15, Math.round(Number(form.get('hourly')) * 100)) }] })
        : quote({ passengers, passengerCapacity: 6, service: { kind:'transfer', baseCents, distanceMeters: Math.round(Number(form.get('distance')) * 1000), centsPerKm: Math.round(Number(form.get('perKm')) * 100) }, nightSurchargeBps: Math.round(Number(form.get('night')) * 100), extras: [{ code:'waiting', cents: waitingCents(Number(form.get('waiting')), 0, 15, Math.round(Number(form.get('hourly')) * 100)) }] });
      setPrice(result);
    } catch { setPrice(null); setPriceError(label('Verifique os valores do simulador.','Check the simulator values.')); }
  };
  return <><div className="pm-columns"><div><Section title={t('rules')}><form className="pm-card pm-form" onSubmit={handleSubmit(v => setResult(Math.max(v.minimum, v.travel + v.tolerance)))} onChange={() => setResult(null)} noValidate>
    <p className="pm-note">{t('simulationNote')}</p>
    {(['minimum', 'tolerance', 'travel'] as const).map((key, index) => <div className="pm-field" key={key}><label htmlFor={key}>{t(['minGap', 'tolerance', 'relocation'][index])}</label><input id={key} type="number" min="0" max="1440" step="1" {...register(key, { valueAsNumber: true })} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined}/>{errors[key] && <p className="pm-error" id={`${key}-error`}>{t('validMinutes')}</p>}</div>)}
    <div className="pm-actions"><Button type="submit"><Calculator size={17} aria-hidden="true" />{t('simulate')}</Button><Button variant="ghost" onClick={() => { reset(); setResult(null); }}><RotateCcw size={17} aria-hidden="true" />{t('reset')}</Button></div>
    <output className="pm-simulation-result" aria-live="polite">{result !== null && <>{t('result')}: <strong>{result} {t('minutes')}</strong></>}</output>
  </form></Section></div><Section title={t('policies')}><div className="pm-card pm-group"><Row label={t('deposit')} value="25%"/><Row label={t('balance')} value="75%"/><Row label={t('cancellation')} value={t('cancellationValue')}/><Row label={t('leadTime')} value={t('leadTimeValue')}/><Row label={t('accept')} value={t('acceptValue')}/></div></Section></div><Section title={label('Simulador de preço','Price simulator')}><form className="pm-card pm-form" aria-label={label('Simulador de preço','Price simulator')} onSubmit={simulatePrice}><p className="pm-note">{label('Simulação local; não publica nem guarda tarifas.','Local simulation; it does not publish or save rates.')}</p><label>{label('Serviço','Service')}<select name="service" defaultValue="transfer"><option value="transfer">Transfer</option><option value="tour">Tour</option></select></label><label>{label('Passageiros','Passengers')}<input name="passengers" type="number" min="1" max="6" defaultValue="2" required/></label><label>{label('Preço base (€)','Base price (€)')}<input name="base" type="number" min="0" step="0.01" defaultValue="10" required/></label><label>{label('Distância (km)','Distance (km)')}<input name="distance" type="number" min="0" step="0.1" defaultValue="35" required/></label><label>{label('Preço por km (€)','Price per km (€)')}<input name="perKm" type="number" min="0" step="0.01" defaultValue="2" required/></label><label>{label('Suplemento noturno (%)','Night surcharge (%)')}<input name="night" type="number" min="0" max="100" step="0.01" defaultValue="0" required/></label><label>{label('Espera (min)','Waiting (min)')}<input name="waiting" type="number" min="0" max="1440" step="1" defaultValue="0" required/></label><label>{label('Preço de espera/hora (€)','Waiting price/hour (€)')}<input name="hourly" type="number" min="0" step="0.01" defaultValue="24" required/></label><div className="pm-actions"><Button type="submit"><Calculator size={17} aria-hidden="true" />{label('Simular preço','Simulate price')}</Button></div>{priceError&&<p role="alert">{priceError}</p>}{price&&<div className="pm-card pm-group pm-price-result" aria-live="polite"><Row label={label('Total','Total')} value={money(price.totalCents)}/><Row label={label('Sinal · 25%','Deposit · 25%')} value={money(price.depositCents)}/><Row label={label('Saldo · 75%','Balance · 75%')} value={money(price.balanceCents)}/>{price.lines.filter(line=>line.cents>0).map(line=><Row key={line.code} label={line.code} value={money(line.cents)}/>)}</div>}</form></Section></>;
}
