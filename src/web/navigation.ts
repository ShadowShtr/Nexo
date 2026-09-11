import { House, CalendarDays, CalendarCheck2, UsersRound, UserRound, CarFront, MapPinned, Wallet, Handshake, Settings2, Clock3, Route, Search, Compass } from 'lucide-react';
export const areas = {
  owner: ['home', 'calendar', 'bookings', 'customers', 'drivers', 'vehicles', 'tours', 'finance', 'settlements', 'settings'],
  driver: ['home', 'services', 'availability', 'earnings', 'profile'],
  customer: ['discover', 'booking', 'lookup'],
} as const;
export type Area = keyof typeof areas;
export type Page = typeof areas[Area][number];
export const icons = { home: House, calendar: CalendarDays, bookings: CalendarCheck2, customers: UsersRound, drivers: UserRound, vehicles: CarFront, tours: MapPinned, finance: Wallet, settlements: Handshake, settings: Settings2, services: Route, availability: Clock3, earnings: Wallet, profile: UserRound, discover: Compass, booking: CalendarCheck2, lookup: Search };
export function parseRoute(hash: string): { area: Area; page: Page | 'more' } {
  const [a, p] = hash.replace(/^#\/?/, '').split('/');
  const area: Area = a === 'driver' || a === 'customer' ? a : 'owner';
  const pages: readonly string[] = areas[area];
  return { area, page: p === 'more' ? 'more' : pages.includes(p) ? p as Page : areas[area][0] };
}
export const hrefFor = (area: Area, page: string) => `#/${area}/${page}`;
