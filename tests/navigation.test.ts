import test from 'node:test';
import assert from 'node:assert/strict';
import { tourRoute, transferRoutes, wazeHref } from '../src/web/demo-routes.ts';

test('demo routes keep ordered pickup, stops and destination', () => {
  assert.equal(transferRoutes.length, 3);
  for (const route of [...transferRoutes, tourRoute]) {
    assert.equal(route.points[0].kind, 'pickup');
    assert.equal(route.points.at(-1)?.kind, 'destination');
    assert.ok(route.meters > 0);
    assert.ok(route.minutes > 0);
    assert.ok(route.shape.length >= route.points.length);
  }
  assert.deepEqual(tourRoute.points.map(point => point.kind), ['pickup','stop','destination']);
});

test('Waze deep link uses coordinates, navigation and source identification', () => {
  const url = new URL(wazeHref([38.6979,-9.4215]));
  assert.equal(url.origin, 'https://waze.com');
  assert.equal(url.pathname, '/ul');
  assert.equal(url.searchParams.get('ll'), '38.6979,-9.4215');
  assert.equal(url.searchParams.get('navigate'), 'yes');
  assert.equal(url.searchParams.get('utm_source'), 'premium_mobility_demo');
});
