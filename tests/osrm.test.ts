import test from 'node:test';
import assert from 'node:assert/strict';
import { osrmRouteProvider } from '../src/infrastructure/routing/osrm.ts';

const points = [
  { label: 'A', latitude: 38.7, longitude: -9.1 },
  { label: 'B', latitude: 38.8, longitude: -9.2 },
];

test('OSRM adapter sends ordered coordinates and rounds distance/duration conservatively', async () => {
  let requested = '';
  const provider = osrmRouteProvider('https://router.example.invalid/', async (url, init) => {
    requested = String(url);
    assert.equal(init?.headers?.accept, 'application/json');
    return { ok: true, status: 200, json: async () => ({ code: 'Ok', routes: [{ distance: 12500.1, duration: 2700.1 }] }) };
  });
  const result = await provider.estimate({ serviceKind: 'transfer', points });
  assert.deepEqual(result, { provider: 'osrm', distanceMeters: 12501, durationMinutes: 46 });
  assert.match(requested, /route\/v1\/driving\/-9\.1,38\.7;-9\.2,38\.8/);
  assert.match(requested, /overview=false/);
});

test('OSRM adapter never fabricates a route when the provider reports no route', async () => {
  const provider = osrmRouteProvider('https://router.example.invalid', async () => ({ ok: true, status: 200, json: async () => ({ code: 'NoRoute', routes: [] }) }));
  assert.equal(await provider.estimate({ serviceKind: 'transfer', points }), null);
});

test('provider HTTP/network errors and missing coordinates remain explicit', async () => {
  const http = osrmRouteProvider('https://router.example.invalid', async () => ({ ok: false, status: 503, json: async () => ({}) }));
  await assert.rejects(() => http.estimate({ serviceKind: 'transfer', points }), /ROUTE_PROVIDER_HTTP_503/);
  const network = osrmRouteProvider('https://router.example.invalid', async () => { throw new Error('offline'); });
  await assert.rejects(() => network.estimate({ serviceKind: 'transfer', points }), /ROUTE_PROVIDER_UNAVAILABLE/);
  const missing = osrmRouteProvider('https://router.example.invalid', async () => ({ ok: true, status: 200, json: async () => ({}) }));
  await assert.rejects(() => missing.estimate({ serviceKind: 'transfer', points: [{ label: 'A' }, { label: 'B', latitude: 1, longitude: 1 }] }), /ROUTE_COORDINATES_REQUIRED/);
});

test('remote route base must use HTTPS; localhost is permitted for local tests', () => {
  assert.throws(() => osrmRouteProvider('http://router.example.invalid'), /ROUTE_BASE_URL_MUST_BE_HTTPS/);
  assert.doesNotThrow(() => osrmRouteProvider('http://127.0.0.1:8080'));
});
