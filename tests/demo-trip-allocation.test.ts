import test from 'node:test';
import assert from 'node:assert/strict';
import { demoTripAllocation } from '../src/web/demo-trip-allocation.ts';

const trip = { id: 'TEST', driver: 0, car: 0, time: '09:00', end: '10:30' };
test('demo bookings keep Lisbon 09:00 in summer and winter', () => {
  const summer = demoTripAllocation({ ...trip, day: '2026-09-11' });
  const winter = demoTripAllocation({ ...trip, day: '2026-11-11' });
  assert.equal(summer.startsAt, '2026-09-11T08:00:00.000Z');
  assert.equal(summer.endsAt, '2026-09-11T09:30:00.000Z');
  assert.equal(winter.startsAt, '2026-11-11T09:00:00.000Z');
  assert.equal(winter.endsAt, '2026-11-11T10:30:00.000Z');
});
test('demo bookings reject ambiguous and nonexistent Lisbon hours', () => {
  assert.throws(() => demoTripAllocation({ ...trip, day: '2026-03-29', time: '01:30' }));
  assert.throws(() => demoTripAllocation({ ...trip, day: '2026-10-25', time: '01:30' }));
});
