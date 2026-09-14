import test from 'node:test';
import assert from 'node:assert/strict';
import { transitionBooking, type BookingCommandGateway, type BookingRecord } from '../src/application/booking-command.ts';

const org = '00000000-0000-4000-8000-000000000002';
const driver = '00000000-0000-4000-8000-000000000003';
const otherDriver = '00000000-0000-4000-8000-000000000005';
const bookingId = '00000000-0000-4000-8000-000000000006';
const owner = { userId: '00000000-0000-4000-8000-000000000001', organizationId: org, role: 'owner' as const, active: true };
const driverActor = { userId: driver, organizationId: org, role: 'driver' as const, active: true };
const base: BookingRecord = { id: bookingId, organizationId: org, driverUserId: driver, status: 'requested', paymentState: 'pending', driverAcceptance: 'pending', allocationGuaranteed: true, balanceRecorded: false, version: 3 };

function gateway(record = base, overrides: Partial<BookingCommandGateway> = {}): BookingCommandGateway {
  return {
    getBooking: async () => record,
    transitionBooking: async input => ({ id: input.bookingId, status: input.next, version: input.expectedVersion + 1 }),
    ...overrides,
  };
}

test('only the assigned driver can accept or decline an offer', async () => {
  await assert.rejects(() => transitionBooking(owner, { bookingId, next: 'awaiting_payment', expectedVersion: 3 }, gateway()), /DRIVER_REQUIRED/);
  await assert.rejects(() => transitionBooking({ ...driverActor, userId: otherDriver }, { bookingId, next: 'awaiting_payment', expectedVersion: 3 }, gateway()), /FORBIDDEN/);
  let acceptance: string | undefined;
  const result = await transitionBooking(driverActor, { bookingId, next: 'awaiting_payment', expectedVersion: 3 }, gateway(base, { transitionBooking: async input => { acceptance = input.driverAcceptance; return { id: input.bookingId, status: input.next, version: input.expectedVersion + 1 }; } }));
  assert.deepEqual(result, { id: bookingId, status: 'awaiting_payment', version: 4 });
  assert.equal(acceptance, 'accepted');
});

test('confirmation requires accepted driver, succeeded payment and guaranteed allocation', async () => {
  const accepted: BookingRecord = { ...base, status: 'awaiting_payment', driverAcceptance: 'accepted', paymentState: 'pending' };
  await assert.rejects(() => transitionBooking(owner, { bookingId, next: 'confirmed', expectedVersion: 3 }, gateway(accepted)), /PAYMENT_REQUIRED/);
  const paid: BookingRecord = { ...accepted, paymentState: 'succeeded', allocationGuaranteed: false };
  await assert.rejects(() => transitionBooking(owner, { bookingId, next: 'confirmed', expectedVersion: 3 }, gateway(paid)), /ALLOCATION_REQUIRED/);
  const ready: BookingRecord = { ...paid, allocationGuaranteed: true };
  const result = await transitionBooking(owner, { bookingId, next: 'confirmed', expectedVersion: 3 }, gateway(ready));
  assert.equal(result.status, 'confirmed');
});

test('execution is assigned-driver only and entering the trip requires a balance record', async () => {
  const confirmed: BookingRecord = { ...base, status: 'confirmed', driverAcceptance: 'accepted', paymentState: 'succeeded' };
  await assert.rejects(() => transitionBooking(owner, { bookingId, next: 'en_route', expectedVersion: 3 }, gateway(confirmed)), /DRIVER_REQUIRED/);
  const atPlace: BookingRecord = { ...confirmed, status: 'arrived' };
  await assert.rejects(() => transitionBooking(driverActor, { bookingId, next: 'in_progress', expectedVersion: 3 }, gateway(atPlace)), /BALANCE_REQUIRED/);
  const paidBalance: BookingRecord = { ...atPlace, balanceRecorded: true };
  const result = await transitionBooking(driverActor, { bookingId, next: 'in_progress', expectedVersion: 3 }, gateway(paidBalance));
  assert.equal(result.status, 'in_progress');
});

test('stale commands are rejected before writing and terminal bookings do not reopen', async () => {
  let writes = 0;
  await assert.rejects(() => transitionBooking(owner, { bookingId, next: 'confirmed', expectedVersion: 2 }, gateway({ ...base, version: 3 }, { transitionBooking: async input => { writes++; return { id: input.bookingId, status: input.next, version: 4 }; } })), /STALE_VERSION/);
  assert.equal(writes, 0);
  await assert.rejects(() => transitionBooking(owner, { bookingId, next: 'confirmed', expectedVersion: 3 }, gateway({ ...base, status: 'completed', version: 3 })), /Transição inválida/);
});

test('cross-organization and inactive actors cannot transition a booking', async () => {
  await assert.rejects(() => transitionBooking({ ...owner, organizationId: '00000000-0000-4000-8000-000000000007' }, { bookingId, next: 'cancelled', expectedVersion: 3 }, gateway()), /FORBIDDEN/);
  await assert.rejects(() => transitionBooking({ ...owner, active: false }, { bookingId, next: 'cancelled', expectedVersion: 3 }, gateway()), /FORBIDDEN/);
});
