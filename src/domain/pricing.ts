import { integer, ratio, sum } from './validation.ts';

export type Line = { code: string; cents: number };
export type QuoteInput = {
  passengers: number;
  passengerCapacity: number;
  service: { kind: 'transfer'; baseCents: number; distanceMeters: number; centsPerKm: number }
    | { kind: 'tour'; baseCents: number; extraPassengerCents: number };
  nightSurchargeBps?: number;
  extras?: Line[];
};

export function waitingCents(actualMinutes: number, includedMinutes: number, blockMinutes: number, hourlyCents: number): number {
  integer(actualMinutes, 'espera'); integer(includedMinutes, 'espera incluída');
  integer(blockMinutes, 'bloco', 1); integer(hourlyCents, 'preço/hora');
  const chargeable = Math.max(0, actualMinutes - includedMinutes);
  const billed = integer(Math.ceil(chargeable / blockMinutes) * blockMinutes, 'minutos faturados');
  return ratio(hourlyCents, billed, 60);
}

export function paymentSplit(totalCents: number, depositBps = 2500) {
  integer(totalCents, 'total'); integer(depositBps, 'sinal');
  if (depositBps > 10000) throw new RangeError('Sinal superior a 100%');
  const depositCents = ratio(totalCents, depositBps, 10000);
  return { depositCents, balanceCents: totalCents - depositCents };
}

export function quote(input: QuoteInput) {
  integer(input.passengers, 'passageiros', 1); integer(input.passengerCapacity, 'capacidade', 1);
  if (input.passengers > input.passengerCapacity) throw new RangeError('Capacidade insuficiente');
  const lines: Line[] = [{ code: 'base', cents: integer(input.service.baseCents, 'base') }];
  if (input.service.kind === 'transfer') {
    lines.push({ code: 'distance', cents: ratio(integer(input.service.centsPerKm, 'tarifa/km'), integer(input.service.distanceMeters, 'metros'), 1000) });
  } else {
    lines.push({ code: 'extra_passengers', cents: ratio(integer(input.service.extraPassengerCents, 'pessoa extra'), Math.max(0, input.passengers - 2), 1) });
  }
  const coreCents = sum(...lines.map(line => line.cents));
  lines.push({ code: 'night', cents: ratio(coreCents, integer(input.nightSurchargeBps ?? 0, 'suplemento noturno'), 10000) });
  for (const extra of input.extras ?? []) {
    if (!extra.code.trim()) throw new Error('Extra sem código');
    lines.push({ code: `extra:${extra.code}`, cents: integer(extra.cents, 'extra') });
  }
  const totalCents = sum(...lines.map(line => line.cents));
  return { currency: 'EUR' as const, lines, totalCents, ...paymentSplit(totalCents) };
}
