import { integer, sum } from './validation.ts';

export type PaymentPhase = 'deposit' | 'balance' | 'extra';
export type PaymentDirection = 'charge' | 'refund';
export type PaymentEntry = {
  id: string;
  bookingId: string;
  driverUserId: string;
  phase: PaymentPhase;
  direction: PaymentDirection;
  amountCents: number;
  currency: 'EUR';
  providerReference: string;
  idempotencyKey: string;
  recordedAt: string;
};

function amount(entry: PaymentEntry) {
  return integer(entry.amountCents, 'montante', 1);
}

/** Validates an append-only ledger and returns received/refunded totals by booking. */
export function paymentLedgerSummary(entries: PaymentEntry[]) {
  const idempotency = new Set<string>();
  const providerReferences = new Set<string>();
  const byBooking = new Map<string, { receivedCents: number; refundedCents: number; refundableCents: number }>();
  for (const entry of entries) {
    amount(entry);
    if (!entry.bookingId || !entry.driverUserId || !entry.providerReference || !entry.idempotencyKey) throw new Error('Movimento incompleto');
    if (idempotency.has(entry.idempotencyKey)) throw new Error('Idempotência duplicada');
    idempotency.add(entry.idempotencyKey);
    if (providerReferences.has(entry.providerReference)) throw new Error('Referência de pagamento duplicada');
    providerReferences.add(entry.providerReference);
    const current = byBooking.get(entry.bookingId) ?? { receivedCents: 0, refundedCents: 0, refundableCents: 0 };
    if (entry.direction === 'charge') {
      current.receivedCents = sum(current.receivedCents, entry.amountCents);
      current.refundableCents = sum(current.refundableCents, entry.amountCents);
    } else {
      current.refundedCents = sum(current.refundedCents, entry.amountCents);
      if (entry.amountCents > current.refundableCents) throw new Error('Reembolso superior ao recebido');
      current.refundableCents -= entry.amountCents;
    }
    byBooking.set(entry.bookingId, current);
  }
  return { entries, byBooking };
}

export function refundableCents(entries: PaymentEntry[], bookingId: string) {
  return paymentLedgerSummary(entries).byBooking.get(bookingId)?.refundableCents ?? 0;
}
