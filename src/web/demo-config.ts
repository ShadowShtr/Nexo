export const demoTariffStorageKey = 'pm.demo.tariffs';
export const demoTariffChangedEvent = 'pm.demo.tariffs.changed';

export type DemoTariffConfig = {
  transferBaseCents: number;
  transferCentsPerKm: number;
  tourBaseCents: number;
  tourExtraPassengerCents: number;
  waitingCentsPerHour: number;
  nightSurchargeBps: number;
};

export const defaultDemoTariff: DemoTariffConfig = {
  transferBaseCents: 0,
  transferCentsPerKm: 200,
  tourBaseCents: 20000,
  tourExtraPassengerCents: 3500,
  waitingCentsPerHour: 2400,
  nightSurchargeBps: 0,
};

function storage(): Storage | null {
  try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; }
}

export function readDemoTariff(): DemoTariffConfig {
  try {
    const raw = storage()?.getItem(demoTariffStorageKey);
    if (!raw) return { ...defaultDemoTariff };
    const value = JSON.parse(raw) as Partial<DemoTariffConfig>;
    return Object.fromEntries(Object.keys(defaultDemoTariff).map(key => {
      const fallback = defaultDemoTariff[key as keyof DemoTariffConfig];
      const candidate = value[key as keyof DemoTariffConfig];
      return [key, typeof candidate === 'number' && Number.isFinite(candidate) && candidate >= 0 ? candidate : fallback];
    })) as DemoTariffConfig;
  } catch { return { ...defaultDemoTariff }; }
}

export function saveDemoTariff(config: DemoTariffConfig) {
  storage()?.setItem(demoTariffStorageKey, JSON.stringify(config));
  try { window.dispatchEvent(new Event(demoTariffChangedEvent)); } catch { /* optional browser event */ }
}

export function subscribeToDemoTariff(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (event: StorageEvent) => { if (event.key === demoTariffStorageKey) listener(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener(demoTariffChangedEvent, listener);
  return () => { window.removeEventListener('storage', onStorage); window.removeEventListener(demoTariffChangedEvent, listener); };
}
