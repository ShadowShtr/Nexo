/** Valores de negócio aprovados em 09/09/2026; tarifas comerciais continuam por preencher. */
export const approvedDefaults = Object.freeze({
  minimumGapMinutes: 60,
  delayAllowanceMinutes: 15,
  transferLeadMinutes: 120,
  tourLeadMinutes: 2880,
  acceptanceTtlMinutes: 30,
  paymentTtlMinutes: 30,
  depositBps: 2500,
  cancellationCutoffHours: 24,
  rescheduleCutoffHours: 24,
  confirmationMode: 'driver_acceptance' as const,
});
