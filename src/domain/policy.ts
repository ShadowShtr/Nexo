import { instant, integer } from './validation.ts';

export function changeEligibility(now: string, scheduledStart: string, originalStart: string, cutoffHours = 24) {
  integer(cutoffHours, 'antecedência', 1);
  // Preserva a primeira data para impedir extensão artificial da janela por reagendamento.
  const anchor = Math.min(instant(scheduledStart), instant(originalStart));
  const cutoff = anchor - cutoffHours * 60 * 60 * 1000;
  const eligible = instant(now) <= cutoff;
  return { refundEligible: eligible, rescheduleEligible: eligible, cutoffAt: new Date(cutoff).toISOString() };
}

export function customerCancellationRefund(depositPaidCents: number, eligible: boolean): number {
  integer(depositPaidCents, 'sinal pago');
  return eligible ? depositPaidCents : 0;
}
