import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareQuote, type QuotePreparationGateway, type RouteProvider } from '../src/application/prepare-quote.ts';

const organizationId = '00000000-0000-4000-8000-000000000002';
const driverId = '00000000-0000-4000-8000-000000000003';
const vehicleId = '00000000-0000-4000-8000-000000000004';
const request = {
  driverId, vehicleId, serviceKind: 'transfer' as const, passengers: 2,
  pickup: { label: 'Aeroporto de Lisboa', latitude: 38.7742, longitude: -9.1342 },
  stops: [{ label: 'Marquês de Pombal', latitude: 38.7231, longitude: -9.1485 }],
  destination: { label: 'Cascais', latitude: 38.6979, longitude: -9.4215 },
  startsAt: '2026-09-20T10:00:00+01:00',
};

function gateway(overrides: Partial<QuotePreparationGateway> = {}): QuotePreparationGateway {
  return {
    resolvePricing: async () => ({ passengerCapacity: 6, baseCents: 1000, centsPerKm: 200, extraPassengerCents: 3500, nightSurchargeBps: 0, extras: [], tariffVersion: 7, validityMinutes: 30 }),
    saveSnapshot: async input => ({ id: 'quote-1', validUntil: input.validUntil }),
    ...overrides,
  };
}

const road: RouteProvider = { estimate: async ({ points }) => ({ provider: 'test-road', distanceMeters: points.length === 3 ? 12_500 : 10_000, durationMinutes: 45 }) };

test('server preparation orders pickup, stops and destination and snapshots the calculated split', async () => {
  let saved: any;
  const result = await prepareQuote({ organizationId }, request, gateway({ saveSnapshot: async input => { saved = input; return { id: 'quote-1', validUntil: input.validUntil }; } }), road, () => '2026-09-14T10:00:00+01:00');
  assert.equal(result.quote.totalCents, 3500);
  assert.equal(result.quote.depositCents, 875);
  assert.equal(result.quote.balanceCents, 2625);
  assert.equal(result.settingsVersion, 7);
  assert.deepEqual(saved.route.points.map((point: { label: string }) => point.label), ['Aeroporto de Lisboa', 'Marquês de Pombal', 'Cascais']);
  assert.equal(saved.organizationId, organizationId);
  assert.equal(saved.validUntil, '2026-09-14T09:30:00.000Z');
});

test('route failure does not create a quote snapshot', async () => {
  let writes = 0;
  await assert.rejects(() => prepareQuote({ organizationId }, request, gateway({ saveSnapshot: async input => { writes++; return { id: 'x', validUntil: input.validUntil }; } }), { estimate: async () => null }), /ROUTE_UNAVAILABLE/);
  assert.equal(writes, 0);
});

test('capacity is resolved by the server configuration', async () => {
  await assert.rejects(() => prepareQuote({ organizationId }, { ...request, passengers: 7 }, gateway(), road), /Capacidade insuficiente/);
});

test('tour calculation keeps package base and additional passenger rule', async () => {
  const tour = { ...request, serviceKind: 'tour' as const, passengers: 4 };
  const result = await prepareQuote({ organizationId }, tour, gateway({ resolvePricing: async () => ({ passengerCapacity: 6, baseCents: 20_000, centsPerKm: 0, extraPassengerCents: 3500, nightSurchargeBps: 0, extras: [], tariffVersion: 9, validityMinutes: 60 }) }), road);
  assert.equal(result.quote.totalCents, 27_000);
  assert.equal(result.quote.depositCents, 6750);
  assert.equal(result.quote.balanceCents, 20_250);
});

test('incomplete coordinates and invalid tenant are rejected before routing', async () => {
  let calls = 0;
  const routes = { estimate: async () => { calls++; return { provider: 'test', distanceMeters: 1, durationMinutes: 1 }; } };
  await assert.rejects(() => prepareQuote({ organizationId: 'invalid' }, request, gateway(), routes), /INVALID_ORGANIZATION/);
  await assert.rejects(() => prepareQuote({ organizationId }, { ...request, pickup: { label: 'Sem coordenada', latitude: 38 } }, gateway(), routes), /Coordenadas incompletas/);
  assert.equal(calls, 0);
});
