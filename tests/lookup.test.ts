import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBookingReference } from '../src/contracts/lookup.ts';

test('booking lookup normalizes the reference and rejects unsafe input', () => {
  assert.equal(normalizeBookingReference(' client-ab12 '), 'CLIENT-AB12');
  assert.equal(normalizeBookingReference('ABC123'), 'ABC123');
  assert.equal(normalizeBookingReference('a'.repeat(31)), null);
  assert.equal(normalizeBookingReference('CLIENT/AB12'), null);
  assert.equal(normalizeBookingReference(''), null);
});
