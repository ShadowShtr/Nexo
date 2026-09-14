import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSlots, localWallClock } from '../src/domain/slots.ts';

const windows = [{ weekday: 1, startsAt: '09:00', endsAt: '18:00' }];
const base = { zone: 'Europe/Lisbon', slotMinutes: 60, serviceDurationMinutes: 150, minimumLeadMinutes: 60, horizonDays: 1, fromDate: '2026-09-14', now: '2026-09-14T07:00:00+01:00', windows };

test('one-hour grid preserves a 150-minute service and stays inside the working window', () => {
  const slots = generateSlots(base);
  assert.deepEqual(slots.map(slot => slot.localTime), ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']);
  assert.equal(slots.every(slot => Date.parse(slot.endsAt) <= Date.parse('2026-09-14T17:00:00.000Z')), true);
  assert.equal(slots[0].endsAt, '2026-09-14T10:30:00.000Z');
});

test('minimum lead is an elapsed-time boundary and exact threshold is accepted', () => {
  const slots = generateSlots({ ...base, now: '2026-09-14T08:00:00+01:00' });
  assert.equal(slots[0].localTime, '09:00');
  const tooLate = generateSlots({ ...base, now: '2026-09-14T08:00:00.001+01:00' });
  assert.equal(tooLate[0].localTime, '10:00');
});

test('blocked dates and multiple days keep only published working windows', () => {
  const slots = generateSlots({ ...base, serviceDurationMinutes: 60, horizonDays: 3, fromDate: '2026-09-14', blockedDates: ['2026-09-14'], windows: [{ weekday: 1, startsAt: '09:00', endsAt: '10:00' }, { weekday: 2, startsAt: '10:00', endsAt: '12:00' }] });
  assert.deepEqual(slots.map(slot => `${slot.localDate} ${slot.localTime}`), ['2026-09-15 10:00', '2026-09-15 11:00']);
});

test('DST ambiguous and nonexistent wall-clock times are rejected', () => {
  assert.throws(() => localWallClock('2026-11-01', '01:30', 'America/New_York'), /ambígua/);
  assert.throws(() => localWallClock('2026-03-08', '02:30', 'America/New_York'), /inexistente/);
});

test('the same Lisbon local slot maps to one instant regardless of display language', () => {
  const pt = generateSlots(base)[0];
  const en = generateSlots({ ...base, zone: 'Europe/Lisbon' })[0];
  assert.equal(pt.startsAt, en.startsAt);
});

test('invalid midnight notation and crossing windows are rejected explicitly', () => {
  assert.throws(() => localWallClock('2026-09-14', '24:00', 'Europe/Lisbon'), /Hora local inválida/);
  assert.throws(() => generateSlots({ ...base, windows: [{ weekday: 1, startsAt: '23:00', endsAt: '01:00' }] }), /Janela deve terminar/);
});
