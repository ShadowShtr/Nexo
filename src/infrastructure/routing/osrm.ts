import type { QuoteSnapshotCommand, RouteEstimate, RouteProvider } from '../../application/prepare-quote.ts';

type FetchResponse = { ok: boolean; status: number; json(): Promise<unknown> };
type FetchLike = (input: string | URL, init?: { headers?: Record<string, string>; signal?: AbortSignal }) => Promise<FetchResponse>;
type RoutePoint = QuoteSnapshotCommand['route']['points'][number];

function coordinates(points: RoutePoint[]) {
  if (points.length < 2 || points.some(point => point.latitude === undefined || point.longitude === undefined)) throw new Error('ROUTE_COORDINATES_REQUIRED');
  return points.map(point => `${point.longitude},${point.latitude}`).join(';');
}

function safeBaseUrl(baseUrl: string) {
  const parsed = new URL(baseUrl);
  if (parsed.protocol !== 'https:' && parsed.hostname !== '127.0.0.1' && parsed.hostname !== 'localhost') throw new Error('ROUTE_BASE_URL_MUST_BE_HTTPS');
  return parsed;
}

/** OSRM adapter for server routes. It never returns a straight-line fallback. */
export function osrmRouteProvider(baseUrl: string, fetchImpl: FetchLike = fetch): RouteProvider {
  const root = safeBaseUrl(baseUrl);
  return {
    async estimate({ points }) {
      const url = new URL(`route/v1/driving/${coordinates(points)}`, root);
      url.searchParams.set('overview', 'false');
      url.searchParams.set('steps', 'false');
      let response: FetchResponse;
      try {
        response = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8_000) });
      } catch (error) {
        throw new Error('ROUTE_PROVIDER_UNAVAILABLE', { cause: error });
      }
      if (!response.ok) throw new Error(`ROUTE_PROVIDER_HTTP_${response.status}`);
      const payload = await response.json() as { code?: unknown; routes?: Array<{ distance?: unknown; duration?: unknown }> };
      if (payload.code !== 'Ok' || !payload.routes?.[0]) return null;
      const distance = payload.routes[0].distance;
      const duration = payload.routes[0].duration;
      if (typeof distance !== 'number' || !Number.isFinite(distance) || distance < 1 || typeof duration !== 'number' || !Number.isFinite(duration) || duration < 1) return null;
      const distanceMeters = Math.ceil(distance);
      const durationMinutes = Math.ceil(duration / 60);
      if (!Number.isSafeInteger(distanceMeters) || !Number.isSafeInteger(durationMinutes)) return null;
      const estimate: RouteEstimate = { provider: 'osrm', distanceMeters, durationMinutes };
      return estimate;
    },
  };
}
