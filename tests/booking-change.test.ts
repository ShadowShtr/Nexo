import test from 'node:test';
import assert from 'node:assert/strict';
import { cancelBooking, proposeReschedule, type BookingChangeGateway, type ChangeBooking } from '../src/application/booking-change.ts';

const org = '00000000-0000-4000-8000-000000000002';
const customerId = '00000000-0000-4000-8000-000000000007';
const driverId = '00000000-0000-4000-8000-000000000003';
const bookingId = '00000000-0000-4000-8000-000000000006';
const customer = { organizationId: org, userId: customerId, role: 'customer' as const, active: true };
const driver = { organizationId: org, userId: driverId, role: 'driver' as const, active: true };
const base: ChangeBooking = { id: bookingId, organizationId: org, customerId, driverUserId: driverId, status: 'confirmed', startsAt: '2026-09-16T10:00:00+01:00', endsAt: '2026-09-16T12:00:00+01:00', originalStartsAt: '2026-09-16T10:00:00+01:00', depositPaidCents: 2500, totalPaidCents: 10000, version: 4 };

function gateway(record = base, overrides: Partial<BookingChangeGateway> = {}): BookingChangeGateway {
  return {
    getBooking: async () => record,
    authorizeCustomer: async ({ token }) => token === 'customer-token-0001',
    cancel: async input => ({ id: input.bookingId, status: 'cancelled', version: input.expectedVersion + 1, refundCents: input.refundCents }),
    prepareQuoteForReschedule: async () => ({ quoteId: '00000000-0000-4000-8000-000000000008' }),
    checkAvailability: async () => ({ available: true }),
    createRescheduleProposal: async input => ({ id: 'proposal-1', status: 'proposed', version: input.expectedVersion + 1, quoteId: input.quoteId }),
    ...overrides,
  };
}

test('customer cancellation at exactly 24h refunds the paid deposit', async () => {
  let refund = -1;
  const result = await cancelBooking(customer, { bookingId, expectedVersion: 4, customerToken: 'customer-token-0001' }, gateway(base, { cancel: async input => { refund = input.refundCents; return { id: bookingId, status: 'cancelled', version: 5, refundCents: input.refundCents }; } }), () => '2026-09-15T10:00:00+01:00');
  assert.equal(result.refundCents, 2500);
  assert.equal(refund, 2500);
});

test('customer cancellation inside 24h retains the deposit, while driver cancellation refunds all paid', async () => {
  const late = await cancelBooking(customer, { bookingId, expectedVersion: 4, customerToken: 'customer-token-0001' }, gateway(), () => '2026-09-15T10:00:00.001+01:00');
  assert.equal(late.refundCents, 0);
  const driverResult = await cancelBooking(driver, { bookingId, expectedVersion: 4, reason: 'Indisponibilidade' }, gateway());
  assert.equal(driverResult.refundCents, 10000);
});

test('customer token, actor and version are checked before cancellation', async () => {
  await assert.rejects(() => cancelBooking(customer, { bookingId, expectedVersion: 4, customerToken: 'wrong-token-0000' }, gateway()), /FORBIDDEN/);
  await assert.rejects(() => cancelBooking({ ...driver, userId: '00000000-0000-4000-8000-000000000005' }, { bookingId, expectedVersion: 4 }, gateway()), /FORBIDDEN/);
  await assert.rejects(() => cancelBooking(customer, { bookingId, expectedVersion: 3, customerToken: 'customer-token-0001' }, gateway()), /STALE_VERSION/);
});

test('reschedule is a new proposal with a new quote and preserves the original start', async () => {
  let proposal: any;
  const result = await proposeReschedule(customer, { bookingId, expectedVersion: 4, customerToken: 'customer-token-0001', startsAt: '2026-09-17T10:00:00+01:00', endsAt: '2026-09-17T12:00:00+01:00', idempotencyKey: 'reschedule-0000001' }, gateway(base, { createRescheduleProposal: async input => { proposal = input; return { id: 'proposal-1', status: 'proposed', version: 5, quoteId: input.quoteId }; } }), () => '2026-09-15T10:00:00+01:00');
  assert.equal(result.status, 'proposed');
  assert.equal(proposal.originalStartsAt, base.originalStartsAt);
  assert.equal(proposal.quoteId, '00000000-0000-4000-8000-000000000008');
  assert.equal(proposal.startsAt, '2026-09-17T10:00:00+01:00');
});

test('reschedule keeps the original booking on conflict, cutoff and stale version', async () => {
  const input = { bookingId, expectedVersion: 4, customerToken: 'customer-token-0001', startsAt: '2026-09-17T10:00:00+01:00', endsAt: '2026-09-17T12:00:00+01:00', idempotencyKey: 'reschedule-0000001' };
  await assert.rejects(() => proposeReschedule(customer, input, gateway(base, { checkAvailability: async () => ({ available: false }) }), () => '2026-09-15T10:00:00+01:00'), /RESCHEDULE_CONFLICT/);
  await assert.rejects(() => proposeReschedule(customer, input, gateway(), () => '2026-09-15T10:00:00.001+01:00'), /OUTSIDE_CHANGE_WINDOW/);
  await assert.rejects(() => proposeReschedule(customer, { ...input, expectedVersion: 3 }, gateway(), () => '2026-09-15T10:00:00+01:00'), /STALE_VERSION/);
});

test('a new schedule in the past and an assigned driver proposal are rejected', async () => {
  const input = { bookingId, expectedVersion: 4, customerToken: 'customer-token-0001', startsAt: '2026-09-14T10:00:00+01:00', endsAt: '2026-09-14T12:00:00+01:00', idempotencyKey: 'reschedule-0000002' };
  await assert.rejects(() => proposeReschedule(customer, input, gateway(), () => '2026-09-15T10:00:00+01:00'), /NEW_START_IN_PAST/);
  await assert.rejects(() => proposeReschedule(driver, { ...input, customerToken: undefined }, gateway(), () => '2026-09-15T10:00:00+01:00'), /CUSTOMER_OR_OWNER_REQUIRED/);
});
