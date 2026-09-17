import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { quote } from '../../domain/pricing';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';

export function TourSimulator() {
  const { t, i18n } = useTranslation();
  const [passengers, setPassengers] = useState(2);
  const price = quote({ passengers, passengerCapacity: 6, service: { kind: 'tour', baseCents: 20000, extraPassengerCents: 3500 } });
  const money = (cents: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(cents / 100);
  return <Section title={t('tourTitle')}>
    <div className="pm-simulator-intro"><p className="pm-note">{t('tourNote')}</p><span className="pm-status" data-tone="neutral">{t('sampleBadge')}</span></div>
    <div className="pm-tour-simulator">
      <div className="pm-card pm-tour pm-tour-simulator-card"><div className="pm-simulator-card-head"><div className="pm-form-heading-icon"><img className="pm-tour-simulator-icon" src="/owner-icon-tours.png" alt="" aria-hidden="true" /></div><div><span className="pm-eyebrow">{t('tourTitle')}</span><h3>{t('included')}</h3></div></div><p className="pm-secondary">{t('extra')}: <strong>{money(3500)}</strong></p><div className="pm-stepper"><span>{t('passengers')}</span><Button variant="secondary" aria-label={t('fewer')} disabled={passengers === 1} onClick={() => setPassengers(n => n - 1)}>−</Button><output aria-live="polite">{passengers}</output><Button variant="secondary" aria-label={t('morePassengers')} disabled={passengers === 6} onClick={() => setPassengers(n => n + 1)}>+</Button></div></div>
      <div className="pm-summary pm-tour-quote" aria-live="polite"><div className="pm-quote-heading"><div><p className="pm-eyebrow">{t('total')}</p><span>{t('included')}</span></div><strong>{money(price.totalCents)}</strong></div><div className="pm-summary-split"><div><p>{t('deposit')} · 25%</p><strong>{money(price.depositCents)}</strong></div><div><p>{t('balance')}</p><strong>{money(price.balanceCents)}</strong></div></div></div>
    </div>
    <div className="pm-card pm-group pm-breakdown"><div className="pm-breakdown-heading"><span className="pm-eyebrow">{t('breakdown')}</span><strong>{money(price.totalCents)}</strong></div><Row label={t('base')} value={money(20000)}/><Row label={t('extras')} value={money(Math.max(0, passengers - 2) * 3500)}/></div>
  </Section>;
}
