import test from 'node:test';
import assert from 'node:assert/strict';
import { availableCustomerTimes, defaultOwnerCalendar, isCustomerSlotAvailable, type CalendarBooking } from '../src/web/customer-availability.ts';

const resource = [{ driverId: '0', vehicleId: '0' }];
const openDay = { ...defaultOwnerCalendar, weekdays: [1, 2, 3, 4, 5, 6, 7] };

test('customer calendar exposes every hour of a 24-hour owner schedule', () => {
  const times = availableCustomerTimes('2026-09-14', 60, [], openDay, resource);
  assert.equal(times.length, 24);
  assert.equal(times[0], '00:00');
  assert.equal(times.at(-1), '23:00');
});

test('a booking removes its hour and keeps the next hour hidden as buffer', () => {
  const booking: CalendarBooking = { id: 'CLIENT-1', driverId: '*', vehicleId: '*', startsAt: '2026-09-15T15:00:00+01:00', endsAt: '2026-09-15T16:00:00+01:00', status: 'requested' };
  const times = availableCustomerTimes('2026-09-15', 60, [booking], openDay, resource);
  assert.equal(times.includes('15:00'), false);
  assert.equal(times.includes('16:00'), false);
  assert.equal(times.includes('17:00'), true);
});

test('owner blocked dates and windows remove slots before they reach the customer', () => {
  const settings = { ...openDay, weekdays: [1], blockedDates: ['2026-09-14'] };
  assert.equal(isCustomerSlotAvailable('2026-09-14', '10:00', 60, [], settings, resource), false);
  assert.equal(isCustomerSlotAvailable('2026-09-15', '10:00', 60, [], settings, resource), false);
});
