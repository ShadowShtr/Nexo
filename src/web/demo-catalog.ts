export type DemoDriver = { id: string; name: string; english: string; phone: string; status: 'active' | 'inactive'; vehicles: string[] };
export type DemoVehicle = { id: string; registration: string; make: string; model: string; capacity: number; luggage: number; notice: number; supplement: number; status: 'active' | 'inactive'; driverIds: string[] };
export type DemoCatalog = { drivers: DemoDriver[]; vehicles: DemoVehicle[] };

export const demoCatalogStorageKey = 'pm.demo.catalog';
export const demoCatalogChangedEvent = 'pm.demo.catalog.changed';

export const seedDemoCatalog: DemoCatalog = {
  drivers: [
    { id: 'd1', name: 'Miguel Costa', english: 'Michael Costa', phone: '+351 910 000 001', status: 'active', vehicles: ['v1', 'v2'] },
    { id: 'd2', name: 'Sofia Martins', english: 'Sofia Martins', phone: '+351 910 000 002', status: 'active', vehicles: ['v3'] },
    { id: 'd3', name: 'André Ribeiro', english: 'Andrew Ribeiro', phone: '+351 910 000 003', status: 'inactive', vehicles: ['v4'] },
  ],
  vehicles: [
    { id: 'v1', registration: '00-AA-00', make: 'Mercedes-Benz', model: 'Classe E', capacity: 4, luggage: 2, notice: 2, supplement: 0, status: 'active', driverIds: ['d1'] },
    { id: 'v2', registration: '00-BB-00', make: 'Mercedes-Benz', model: 'Classe V', capacity: 6, luggage: 6, notice: 48, supplement: 3500, status: 'active', driverIds: ['d1'] },
    { id: 'v3', registration: '00-CC-00', make: 'BMW', model: 'Série 5', capacity: 4, luggage: 2, notice: 2, supplement: 0, status: 'active', driverIds: ['d2'] },
    { id: 'v4', registration: '00-DD-00', make: 'Volvo', model: 'XC90', capacity: 6, luggage: 4, notice: 2, supplement: 1500, status: 'inactive', driverIds: ['d3'] },
  ],
};

function storage(): Storage | null {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

export function readDemoCatalog(): DemoCatalog {
  try {
    const raw = storage()?.getItem(demoCatalogStorageKey);
    if (!raw) return structuredClone(seedDemoCatalog);
    const parsed = JSON.parse(raw) as Partial<DemoCatalog>;
    const validDriver = (row: unknown): row is DemoDriver => Boolean(row && typeof row === 'object'
      && typeof (row as DemoDriver).id === 'string' && typeof (row as DemoDriver).name === 'string'
      && typeof (row as DemoDriver).english === 'string' && ['active', 'inactive'].includes((row as DemoDriver).status)
      && Array.isArray((row as DemoDriver).vehicles));
    const validVehicle = (row: unknown): row is DemoVehicle => Boolean(row && typeof row === 'object'
      && typeof (row as DemoVehicle).id === 'string' && typeof (row as DemoVehicle).make === 'string'
      && typeof (row as DemoVehicle).model === 'string' && Number.isInteger((row as DemoVehicle).capacity)
      && ['active', 'inactive'].includes((row as DemoVehicle).status) && Array.isArray((row as DemoVehicle).driverIds));
    return {
      drivers: Array.isArray(parsed.drivers) ? parsed.drivers.filter(validDriver) : structuredClone(seedDemoCatalog.drivers),
      vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles.filter(validVehicle) : structuredClone(seedDemoCatalog.vehicles),
    };
  } catch { return structuredClone(seedDemoCatalog); }
}

export function saveDemoCatalog(catalog: DemoCatalog) {
  const value = JSON.stringify(catalog);
  if (storage()?.getItem(demoCatalogStorageKey) === value) return;
  storage()?.setItem(demoCatalogStorageKey, value);
  try { window.dispatchEvent(new Event(demoCatalogChangedEvent)); } catch { /* local demo notification only */ }
}

export function subscribeToDemoCatalog(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (event: StorageEvent) => { if (event.key === demoCatalogStorageKey) callback(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener(demoCatalogChangedEvent, callback);
  return () => { window.removeEventListener('storage', onStorage); window.removeEventListener(demoCatalogChangedEvent, callback); };
}
