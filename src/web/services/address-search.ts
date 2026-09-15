export type AddressSearchResult = {
  title: string;
  detail: string;
  coordinates: readonly [number, number];
  source: 'geoapify' | 'photon';
};

type SearchOptions = {
  queries: readonly string[];
  language: 'pt' | 'en';
  signal: AbortSignal;
  geoapifyKey?: string;
  geoapifyUrl?: string;
  photonUrl?: string;
  fetcher?: typeof fetch;
};

const portugalBias = { latitude: '38.7223', longitude: '-9.1393' };

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function getJson(url: string, signal: AbortSignal, fetcher: typeof fetch) {
  const requestController = new AbortController();
  const relayAbort = () => requestController.abort();
  signal.addEventListener('abort', relayAbort, { once: true });
  const timeout = globalThis.setTimeout(() => requestController.abort(), 3000);
  try {
    const response = await fetcher(url, { headers: { Accept: 'application/json' }, signal: requestController.signal });
    if (!response.ok) return undefined;
    return response.json() as Promise<unknown>;
  } finally {
    globalThis.clearTimeout(timeout);
    signal.removeEventListener('abort', relayAbort);
  }
}

function parseGeoapify(payload: unknown): AddressSearchResult[] {
  const source = payload as {
    results?: Array<Record<string, unknown>>;
    features?: Array<{ properties?: Record<string, unknown> }>;
  };
  const rows = source.results ?? source.features?.map(feature => feature.properties ?? {}) ?? [];
  return rows.flatMap(row => {
    const latitude = Number(row.lat);
    const longitude = Number(row.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    const title = text(row.address_line1) || text(row.name) || text(row.street) || text(row.formatted);
    if (!title) return [];
    const detail = text(row.address_line2) || [text(row.postcode), text(row.city), text(row.county), text(row.country)].filter(Boolean).join(', ') || 'Portugal';
    return [{ title, detail, coordinates: [latitude, longitude] as const, source: 'geoapify' as const }];
  });
}

function parsePhoton(payload: unknown): AddressSearchResult[] {
  const source = payload as {
    features?: Array<{
      properties?: Record<string, unknown>;
      geometry?: { coordinates?: [number, number] };
    }>;
  };
  return (source.features ?? []).flatMap(feature => {
    const coordinates = feature.geometry?.coordinates;
    if (!coordinates || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) return [];
    const properties = feature.properties ?? {};
    const name = text(properties.name);
    const street = text(properties.street);
    const houseNumber = text(properties.housenumber);
    const title = name && !/^\d+[A-Za-z]?$/.test(name) ? name : [street, houseNumber].filter(Boolean).join(' ') || name;
    if (!title) return [];
    const detail = [street && street !== name ? street : '', houseNumber && houseNumber !== name ? houseNumber : '', text(properties.postcode), text(properties.city), text(properties.state), text(properties.country)].filter(Boolean).join(', ') || 'Portugal';
    return [{ title, detail, coordinates: [coordinates[1], coordinates[0]] as const, source: 'photon' as const }];
  });
}

function unique(results: readonly AddressSearchResult[]) {
  const seen = new Set<string>();
  return results.filter(result => {
    const key = `${result.title}|${result.detail}`.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchAddresses({ queries, language, signal, geoapifyKey, geoapifyUrl = 'https://api.geoapify.com/v1/geocode/autocomplete', photonUrl = 'https://photon.komoot.io/api/', fetcher = fetch }: SearchOptions) {
  const candidates = queries.map(query => query.trim()).filter(query => query.length >= 3).slice(0, 6);
  if (!candidates.length) return [];

  if (geoapifyKey) {
    const params = new URLSearchParams({
      text: candidates[0],
      format: 'json',
      filter: 'countrycode:pt',
      bias: `proximity:${portugalBias.longitude},${portugalBias.latitude}`,
      limit: '8',
      lang: language,
      apiKey: geoapifyKey,
    });
    try {
      const payload = await getJson(`${geoapifyUrl}?${params.toString()}`, signal, fetcher);
      const results = payload ? parseGeoapify(payload) : [];
      if (results.length) return unique(results).slice(0, 8);
    } catch (error) {
      if (signal.aborted) throw error;
    }
  }

  const results: AddressSearchResult[] = [];
  for (const query of candidates) {
    if (signal.aborted) break;
    const params = new URLSearchParams({
      q: `${query}, Portugal`,
      limit: '8',
      lat: portugalBias.latitude,
      lon: portugalBias.longitude,
    });
    // Photon só aceita atualmente default, de, en e fr. O idioma default
    // preserva os nomes portugueses; enviar `pt` faz o serviço rejeitar.
    if (language === 'en') params.set('lang', 'en');
    try {
      const payload = await getJson(`${photonUrl}?${params.toString()}`, signal, fetcher);
      if (payload) results.push(...parsePhoton(payload));
    } catch (error) {
      if (signal.aborted) throw error;
    }
    if (unique(results).length >= 6) break;
  }
  return unique(results).slice(0, 8);
}
