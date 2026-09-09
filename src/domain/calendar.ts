import { instant, integer } from './validation.ts';

export type Allocation = {
  id: string;
  driverId: string;
  vehicleId: string;
  startsAt: string;
  endsAt: string;
  status: 'requested' | 'awaiting_payment' | 'confirmed' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | 'declined';
  holdExpiresAt?: string;
};
export type CalendarRules = { minimumGapMinutes: number; delayAllowanceMinutes: number };

export function requiredGapMinutes(relocationMinutes: number, rules: CalendarRules): number {
  integer(relocationMinutes, 'deslocação'); integer(rules.minimumGapMinutes, 'margem mínima'); integer(rules.delayAllowanceMinutes, 'atraso');
  return integer(Math.max(rules.minimumGapMinutes, relocationMinutes + rules.delayAllowanceMinutes), 'intervalo');
}

function blocking(item: Allocation, nowMs: number): boolean {
  if (['cancelled', 'expired', 'declined'].includes(item.status)) return false;
  if (item.status === 'requested' || item.status === 'awaiting_payment') {
    // Falta de expiração é erro de dados; bloqueio conservador.
    return !item.holdExpiresAt || instant(item.holdExpiresAt) > nowMs;
  }
  return true;
}

/** Valida conflitos entre recursos. Não substitui transação, horário de trabalho ou área de serviço. */
export function checkSchedule(
  candidate: Allocation,
  existing: Allocation[],
  now: string,
  rules: CalendarRules,
  relocation: (from: Allocation, to: Allocation) => number | undefined,
) {
  const start = instant(candidate.startsAt), end = instant(candidate.endsAt), nowMs = instant(now);
  if (end <= start || start < nowMs) throw new RangeError('Intervalo inválido ou no passado');
  requiredGapMinutes(0, rules);
  const conflicts: { bookingId: string; reason: 'overlap' | 'gap' | 'route_unknown'; requiredMinutes?: number }[] = [];
  const relevant = existing.filter(other => other.id !== candidate.id && blocking(other, nowMs)
    && (other.driverId === candidate.driverId || other.vehicleId === candidate.vehicleId));
  const neighbors = new Map<string, Allocation>();
  for (const other of relevant) {
    const otherStart = instant(other.startsAt), otherEnd = instant(other.endsAt);
    if (otherEnd <= otherStart) throw new Error('Reserva existente inválida');
    if (start < otherEnd && otherStart < end) {
      conflicts.push({ bookingId: other.id, reason: 'overlap' });
    }
  }
  // Só os vizinhos imediatos de cada recurso determinam a deslocação real.
  // Consultar reservas remotas poderia criar conflitos falsos por rotas irrelevantes.
  for (const resource of ['driverId', 'vehicleId'] as const) {
    const matches = relevant.filter(other => other[resource] === candidate[resource]);
    const previous = matches.filter(other => instant(other.endsAt) <= start)
      .sort((a, b) => instant(b.endsAt) - instant(a.endsAt))[0];
    const next = matches.filter(other => instant(other.startsAt) >= end)
      .sort((a, b) => instant(a.startsAt) - instant(b.startsAt))[0];
    if (previous) neighbors.set(previous.id, previous);
    if (next) neighbors.set(next.id, next);
  }
  for (const other of neighbors.values()) {
    const otherEnd = instant(other.endsAt);
    const [previous, next] = otherEnd <= start ? [other, candidate] : [candidate, other];
    const travel = relocation(previous, next);
    if (travel === undefined) { conflicts.push({ bookingId: other.id, reason: 'route_unknown' }); continue; }
    const requiredMinutes = requiredGapMinutes(travel, rules);
    if ((instant(next.startsAt) - instant(previous.endsAt)) / 60000 < requiredMinutes) {
      conflicts.push({ bookingId: other.id, reason: 'gap', requiredMinutes });
    }
  }
  return { available: conflicts.length === 0, conflicts };
}
