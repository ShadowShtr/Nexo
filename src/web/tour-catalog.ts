import type { AddressSearchResult } from './services/address-search';

export const tourCatalogStorageKey = 'pm.demo.tours';
export const tourCatalogChangedEvent = 'pm.demo.tours.changed';

export type PublishedTour = {
  id: string;
  namePt: string;
  nameEn: string;
  descriptionPt: string;
  descriptionEn: string;
  durationDays: 2;
  baseCents: number;
  extraPassengerCents: number;
  minimumNoticeHours: number;
  active: boolean;
  area: string;
  photoPath: string;
  location?: AddressSearchResult;
};

function storage(): Storage | undefined {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; } catch { return undefined; }
}

function isLocation(value: unknown): value is AddressSearchResult {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AddressSearchResult>;
  return typeof candidate.title === 'string'
    && typeof candidate.detail === 'string'
    && Array.isArray(candidate.coordinates)
    && candidate.coordinates.length === 2
    && candidate.coordinates.every(point => typeof point === 'number' && Number.isFinite(point));
}

export function readPublishedTours(): PublishedTour[] {
  const raw = storage()?.getItem(tourCatalogStorageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Partial<PublishedTour> => Boolean(item && typeof item === 'object'))
      .filter(item => typeof item.id === 'string' && typeof item.namePt === 'string' && typeof item.nameEn === 'string' && typeof item.area === 'string')
      .map(item => ({
        id: item.id!,
        namePt: item.namePt!.trim(),
        nameEn: item.nameEn!.trim(),
        descriptionPt: typeof item.descriptionPt === 'string' ? item.descriptionPt : '',
        descriptionEn: typeof item.descriptionEn === 'string' ? item.descriptionEn : '',
        durationDays: 2 as const,
        baseCents: typeof item.baseCents === 'number' && Number.isFinite(item.baseCents) ? item.baseCents : 0,
        extraPassengerCents: typeof item.extraPassengerCents === 'number' && Number.isFinite(item.extraPassengerCents) ? item.extraPassengerCents : 0,
        minimumNoticeHours: typeof item.minimumNoticeHours === 'number' && Number.isFinite(item.minimumNoticeHours) ? item.minimumNoticeHours : 48,
        active: item.active !== false,
        area: item.area!.trim(),
        photoPath: typeof item.photoPath === 'string' && item.photoPath ? item.photoPath : '/lisbon-sintra-tour.webp',
        location: isLocation(item.location) ? item.location : undefined,
      }))
      .filter(item => item.namePt && item.nameEn && item.area);
  } catch { return []; }
}

export function hasStoredTourCatalog(): boolean {
  try { return storage()?.getItem(tourCatalogStorageKey) !== null; } catch { return false; }
}

export function subscribeToTourCatalog(callback: () => void) {
  const refresh = () => callback();
  window.addEventListener('storage', refresh);
  window.addEventListener(tourCatalogChangedEvent, refresh);
  return () => {
    window.removeEventListener('storage', refresh);
    window.removeEventListener(tourCatalogChangedEvent, refresh);
  };
}
