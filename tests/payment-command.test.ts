import test from 'node:test';
import assert from 'node:assert/strict';
import { recordPaymentEvent, type PaymentLedgerGateway, type PaymentContext } from '../src/application/payment-command.ts';
import { paymentLedgerSummary } from '../src/domain/payment-ledger.ts';

const organizationId = '00000000-0000-4000-8000-000000000002';
const bookingId = '00000000-0000-4000-8000-000000000006';
const driverUserId = '00000000-0000-4000-8000-000000000003';
const base = { bookingId, phase: 'deposit' as const, direction: 'charge' as const, amountCents: 2500, currency: 'EUR' as const, providerReference: 'mbway-payment-1', idempotencyKey: 'idem-000000000001', recordedAt: '2026-09-14T10:00:00+01:00' };
const context: PaymentContext = { organizationId, driverUserId, expectedCents: 2500, currency: 'EUR' };

function gateway(entries: any[] = [], overrides: Partial<PaymentLedgerGateway> = {}): PaymentLedgerGateway {
  return {
    context: async () => context,
    findByIdempotency: async ({ idempotencyKey }) => entries.find(entry => entry.idempotencyKey === idempotencyKey) ?? null,
    listEntries: async () => entries,
    append: async entry => { entries.push(entry); return entry; },
    ...overrides,
  };
}

test('verified payment records the server-side driver beneficiary and amount', async () => {
  const result = await recordPaymentEvent({ organizationId, verifiedWebhook: true }, base, gateway());
  assert.equal(result.duplicate, false);
  assert.equal(result.entry.driverUserId, driverUserId);
  assert.equal(result.entry.amountCents, 2500);
});

test('browser-like or unverified events are rejected before any gateway lookup', async () => {
  let lookups = 0;
  await assert.rejects(() => recordPaymentEvent({ organizationId, verifiedWebhook: false }, base, gateway([], { findByIdempotency: async () => { lookups++; return null; } })), /WEBHOOK_UNVERIFIED/);
  assert.equal(lookups, 0);
});

test('duplicate idempotency returns the existing event without appending', async () => {
  const existing = { ...base, id: 'existing', driverUserId, organizationId };
  let writes = 0;
  const result = await recordPaymentEvent({ organizationId, verifiedWebhook: true }, base, gateway([existing], { append: async entry => { writes++; return entry; } }));
  assert.equal(result.duplicate, true);
  assert.equal(result.entry.id, 'existing');
  assert.equal(writes, 0);
});

test('amount, beneficiary context and booking existence are resolved by the server', async () => {
  await assert.rejects(() => recordPaymentEvent({ organizationId, verifiedWebhook: true }, { ...base, amountCents: 1 }, gateway()), /AMOUNT_MISMATCH/);
  await assert.rejects(() => recordPaymentEvent({ organizationId, verifiedWebhook: true }, base, gateway([], { context: async () => null })), /NOT_FOUND/);
  await assert.rejects(() => recordPaymentEvent({ organizationId, verifiedWebhook: true }, base, gateway([], { context: async () => ({ ...context, organizationId: '00000000-0000-4000-8000-000000000007' }) })), /NOT_FOUND/);
});

test('refunds cannot exceed charges and duplicate ledger keys are invalid', async () => {
  const charge = { ...base, id: 'charge', driverUserId, organizationId };
  const refund = { ...base, direction: 'refund' as const, providerReference: 'mbway-refund-1', idempotencyKey: 'idem-000000000002' };
  await assert.rejects(() => recordPaymentEvent({ organizationId, verifiedWebhook: true }, { ...refund, amountCents: 2501 }, gateway([charge])), /AMOUNT_MISMATCH/);
  const summary = paymentLedgerSummary([charge]);
  assert.equal(summary.byBooking.get(bookingId)?.refundableCents, 2500);
  const duplicate = { ...charge, id: 'other' };
  assert.throws(() => paymentLedgerSummary([charge, duplicate]), /Idempotência duplicada/);
});

test('ledger keeps charge and refund history while exposing refundable balance', async () => {
  const charge = { ...base, id: 'charge', driverUserId, organizationId };
  const entries: any[] = [charge];
  const refund = { ...base, direction: 'refund' as const, amountCents: 1000, providerReference: 'mbway-refund-1', idempotencyKey: 'idem-000000000002' };
  await recordPaymentEvent({ organizationId, verifiedWebhook: true }, refund, gateway(entries));
  const summary = paymentLedgerSummary(entries).byBooking.get(bookingId)!;
  assert.equal(summary.receivedCents, 2500);
  assert.equal(summary.refundedCents, 1000);
  assert.equal(summary.refundableCents, 1500);
});
