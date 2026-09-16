import type { Allocation } from '../domain/calendar';
import type { DemoRoute } from './demo-routes';

/**
 * Shared demo handoff between the customer and owner views.
 *
 * This deliberately uses localStorage only for the clickable demo. Production
 * requests must be written through the authenticated server use case.
 */
export const demoCustomerRequestsStorageKey = 'pm.demo.customer-requests';
export const demoCustomerRequestsChangedEvent = 'pm.demo.customer-requests.changed';

export type DemoCustomerRequest = {
  id: string;
  allocation: Allocation;
  driver: number;
  car: number;
  service: 'transfer' | 'tour';
  routeIndex: number;
  origin: string;
  destination: string;
  stops: string[];
  customRoute?: DemoRoute;
  people: number;
  name: string;
  email: string;
  phone: string;
  nif: string;
  total: number;
  deposit: number;
  balance: number;
  cancelled: boolean;
  rescheduled: boolean;
};

function storage(): Storage | null {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

function validRequest(value: unknown): value is DemoCustomerRequest {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<DemoCustomerRequest>;
  const allocation = item.allocation;
  return typeof item.id === 'string' && typeof item.name === 'string' && typeof item.email === 'string'
    && typeof item.phone === 'string' && typeof item.nif === 'string' && typeof item.origin === 'string'
    && typeof item.destination === 'string' && Array.isArray(item.stops)
    && (item.service === 'transfer' || item.service === 'tour') && typeof item.people === 'number'
    && typeof item.total === 'number' && typeof item.deposit === 'number' && typeof item.balance === 'number'
    && typeof item.cancelled === 'boolean' && typeof item.rescheduled === 'boolean'
    && Boolean(allocation) && typeof allocation === 'object'
    && typeof allocation.id === 'string' && typeof allocation.startsAt === 'string' && typeof allocation.endsAt === 'string';
}

export function readDemoCustomerRequests(): DemoCustomerRequest[] {
  const saved = storage()?.getItem(demoCustomerRequestsStorageKey);
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(validRequest) : [];
  } catch { return []; }
}

function notify() {
  try { window.dispatchEvent(new Event(demoCustomerRequestsChangedEvent)); } catch { /* optional browser event */ }
}

function write(rows: DemoCustomerRequest[]) {
  storage()?.setItem(demoCustomerRequestsStorageKey, JSON.stringify(rows));
  notify();
}

export function saveDemoCustomerRequest(request: DemoCustomerRequest) {
  write([...readDemoCustomerRequests().filter(row => row.id !== request.id), request]);
}

export function updateDemoCustomerRequest(id: string, update: (request: DemoCustomerRequest) => DemoCustomerRequest) {
  write(readDemoCustomerRequests().map(request => request.id === id ? update(request) : request));
}

export function subscribeToDemoCustomerRequests(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (event: StorageEvent) => { if (event.key === demoCustomerRequestsStorageKey) listener(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener(demoCustomerRequestsChangedEvent, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(demoCustomerRequestsChangedEvent, listener);
  };
}
