import { integer, sum } from './validation.ts';

export type SettlementEntry = { bookingId: string; ownerFeeCents: number; settledCents: number };

export function settlementSummary(entries: SettlementEntry[]) {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.bookingId)) throw new Error('Serviço duplicado no extrato');
    seen.add(entry.bookingId);
    integer(entry.ownerFeeCents, 'valor do proprietário'); integer(entry.settledCents, 'liquidado');
    if (entry.settledCents > entry.ownerFeeCents) throw new RangeError('Acerto superior à dívida');
  }
  const owedCents = sum(...entries.map(entry => entry.ownerFeeCents));
  const settledCents = sum(...entries.map(entry => entry.settledCents));
  return { owedCents, settledCents, outstandingCents: owedCents - settledCents };
}
