export type DemoPoint = {
  label: string;
  coordinates: readonly [latitude: number, longitude: number];
  kind: 'pickup' | 'stop' | 'destination';
};

export type DemoRoute = {
  name: string;
  meters: number;
  minutes: number;
  points: readonly DemoPoint[];
  shape: readonly (readonly [number, number])[];
};

const point = (label: string, coordinates: readonly [number, number], kind: DemoPoint['kind']): DemoPoint => ({ label, coordinates, kind });

export const transferRoutes: readonly DemoRoute[] = [
  {
    name: 'Aeroporto de Lisboa → Cascais', meters: 35_000, minutes: 90,
    points: [point('Aeroporto de Lisboa', [38.7742, -9.1342], 'pickup'), point('Cascais', [38.6979, -9.4215], 'destination')],
    shape: [[38.7742,-9.1342],[38.748,-9.161],[38.711,-9.205],[38.697,-9.286],[38.6979,-9.4215]],
  },
  {
    name: 'Lisboa → Sintra', meters: 30_000, minutes: 90,
    points: [point('Lisboa', [38.7223, -9.1393], 'pickup'), point('Sintra', [38.8029, -9.3817], 'destination')],
    shape: [[38.7223,-9.1393],[38.750,-9.194],[38.761,-9.260],[38.790,-9.333],[38.8029,-9.3817]],
  },
  {
    name: 'Lisboa → Setúbal', meters: 50_000, minutes: 90,
    points: [point('Lisboa', [38.7223, -9.1393], 'pickup'), point('Setúbal', [38.5244, -8.8882], 'destination')],
    shape: [[38.7223,-9.1393],[38.654,-9.050],[38.615,-9.018],[38.573,-8.935],[38.5244,-8.8882]],
  },
] as const;

export const tourRoute: DemoRoute = {
  name: 'Lisboa → Sintra → Cabo da Roca', meters: 62_000, minutes: 240,
  points: [point('Lisboa', [38.7223,-9.1393], 'pickup'), point('Sintra', [38.8029,-9.3817], 'stop'), point('Cabo da Roca', [38.7804,-9.4989], 'destination')],
  shape: [[38.7223,-9.1393],[38.750,-9.194],[38.790,-9.333],[38.8029,-9.3817],[38.793,-9.432],[38.7804,-9.4989]],
};

export function wazeHref(coordinates: readonly [number, number]) {
  const [latitude, longitude] = coordinates;
  const query = new URLSearchParams({ ll: `${latitude},${longitude}`, navigate: 'yes', utm_source: 'premium_mobility_demo' });
  return `https://waze.com/ul?${query.toString()}`;
}
