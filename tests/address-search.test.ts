import assert from 'node:assert/strict';
import test from 'node:test';
import { searchAddresses } from '../src/web/services/address-search.ts';

test('Photon keeps Portuguese names without sending its unsupported pt language', async () => {
  let requestedUrl = '';
  const results = await searchAddresses({
    queries: ['Rua Pedro de Sintra, Carregado'],
    language: 'pt',
    signal: new AbortController().signal,
    fetcher: async input => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({
        features: [{ properties: { name: 'Rua Pedro de Sintra', city: 'Alenquer', postcode: '2580-510', country: 'Portugal' }, geometry: { coordinates: [-8.9707512, 39.0224941] } }],
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });

  assert.equal(new URL(requestedUrl).searchParams.has('lang'), false);
  assert.deepEqual(results[0], {
    title: 'Rua Pedro de Sintra',
    detail: '2580-510, Alenquer, Portugal',
    coordinates: [39.0224941, -8.9707512],
    source: 'photon',
  });
});

test('Geoapify is preferred when its configured autocomplete returns results', async () => {
  const requests: string[] = [];
  const results = await searchAddresses({
    queries: ['Quinta da Regaleira'],
    language: 'pt',
    signal: new AbortController().signal,
    geoapifyKey: 'test-key',
    fetcher: async input => {
      requests.push(String(input));
      return new Response(JSON.stringify({ results: [{ address_line1: 'Quinta da Regaleira', address_line2: 'Sintra, Portugal', lat: 38.7967, lon: -9.3977 }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  });

  assert.equal(requests.length, 1);
  assert.match(requests[0], /geoapify/);
  assert.equal(results[0]?.source, 'geoapify');
});
