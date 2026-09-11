import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';

export function SettingsPage() {
  const { t } = useTranslation();
  const [result, setResult] = useState<number | null>(null);
  const minutes = z.number().int(t('validMinutes')).min(0, t('validMinutes')).max(1440, t('validMinutes'));
  const schema = z.object({ minimum: minutes, tolerance: minutes, travel: minutes });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { minimum: 60, tolerance: 15, travel: 20 } });
  return <div className="pm-columns"><div><Section title={t('rules')}><form className="pm-card pm-form" onSubmit={handleSubmit(v => setResult(Math.max(v.minimum, v.travel + v.tolerance)))} onChange={() => setResult(null)} noValidate>
    <p className="pm-note">{t('simulationNote')}</p>
    {(['minimum', 'tolerance', 'travel'] as const).map((key, index) => <div className="pm-field" key={key}><label htmlFor={key}>{t(['minGap', 'tolerance', 'relocation'][index])}</label><input id={key} type="number" min="0" max="1440" step="1" {...register(key, { valueAsNumber: true })} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined}/>{errors[key] && <p className="pm-error" id={`${key}-error`}>{t('validMinutes')}</p>}</div>)}
    <div className="pm-actions"><Button type="submit">{t('simulate')}</Button><Button variant="ghost" onClick={() => { reset(); setResult(null); }}>{t('reset')}</Button></div>
    <output className="pm-simulation-result" aria-live="polite">{result !== null && <>{t('result')}: <strong>{result} {t('minutes')}</strong></>}</output>
  </form></Section></div><Section title={t('policies')}><div className="pm-card pm-group"><Row label={t('deposit')} value="25%"/><Row label={t('balance')} value="75%"/><Row label={t('cancellation')} value={t('cancellationValue')}/><Row label={t('leadTime')} value={t('leadTimeValue')}/><Row label={t('accept')} value={t('acceptValue')}/></div></Section></div>;
}
