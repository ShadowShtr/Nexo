import { approvedDefaults } from './defaults.ts';
import { instant, integer } from './validation.ts';

export type LeadTimeRules = {
  transferLeadMinutes: number;
  tourLeadMinutes: number;
};
export type LeadTimeOverrides = { driverMinutes?: number; vehicleMinutes?: number; tourMinutes?: number };

/** Antecedência aplica-se no envio do pedido, não reinicia após aceite/pagamento. */
export function requiredLeadMinutes(kind: 'transfer' | 'tour', overrides: LeadTimeOverrides = {}, rules: LeadTimeRules = approvedDefaults): number {
  const base = integer(rules.transferLeadMinutes, 'antecedência normal');
  const tour = integer(rules.tourLeadMinutes, 'antecedência tour');
  const driver = integer(overrides.driverMinutes ?? 0, 'antecedência motorista');
  const vehicle = integer(overrides.vehicleMinutes ?? 0, 'antecedência veículo');
  const packageLead = integer(overrides.tourMinutes ?? 0, 'antecedência pacote');
  return Math.max(base, driver, vehicle, ...(kind === 'tour' ? [tour, packageLead] : []));
}

export function checkLeadTime(requestedAt: string, startsAt: string, kind: 'transfer' | 'tour', overrides: LeadTimeOverrides = {}, rules: LeadTimeRules = approvedDefaults) {
  const requiredMinutes = requiredLeadMinutes(kind, overrides, rules);
  const leadMs = instant(startsAt) - instant(requestedAt);
  return { eligible: leadMs >= requiredMinutes * 60000, requiredMinutes };
}
