import { DateTime } from 'luxon';

export const ownerCalendarZone = 'Europe/Lisbon';
export const ownerCalendarStorageKey = 'pm.owner.calendar';
export const customerCalendarChangedEvent = 'pm.owner.calendar.changed';
export const customerCalendarBufferMinutes = 60;

export type CalendarBooking = {
  id: string;
  driverId: string;
  vehicleId: string;
  startsAt: string;
  endsAt: string;
  status?: string;
  source?: 'owner' | 'customer';
};

export type OwnerCalendarSettings = {
  weekdays: number[];
  opensAt: string;
  closesAt: string;
  blockedDates: string[];
};

export type OwnerCalendarState = {
  settings: OwnerCalendarSettings;
  bookings: CalendarBooking[];
};

export type CalendarResource = { driverId: string; vehicleId: string };

export const defaultOwnerCalendar: OwnerCalendarSettings = Object.freeze({
  weekdays: [1, 2, 3, 4, 5, 6, 7],
  opensAt: '00:00',
  closesAt: '24:00',
  blockedDates: [],
});

const defaultResources: CalendarResource[] = [
  { driverId: '0', vehicleId: '0' },
  { driverId: '0', vehicleId: '1' },
  { driverId: '1', vehicleId: '2' },
  { driverId: '2', vehicleId: '3' },
];

function storage(): Storage | null {
  try { return typeof window === 'undefined' ? null : window.sessionStorage; } catch { return null; }
}

function notifyCalendarChanged() {
  try { window.dispatchEvent(new Event(customerCalendarChangedEvent)); } catch { /* optional browser event */ }
}

function validBooking(value: unknown): value is CalendarBooking {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CalendarBooking>;
  return typeof item.id === 'string' && typeof item.driverId === 'string' && typeof item.vehicleId === 'string'
    && typeof item.startsAt === 'string' && typeof item.endsAt === 'string';
}

export function readOwnerCalendar(): OwnerCalendarState {
  const saved = storage()?.getItem(ownerCalendarStorageKey);
  if (!saved) return { settings: { ...defaultOwnerCalendar, weekdays: [...defaultOwnerCalendar.weekdays], blockedDates: [] }, bookings: [] };
  try {
    const parsed = JSON.parse(saved) as Partial<OwnerCalendarState>;
    const settings = parsed.settings && typeof parsed.settings === 'object' ? parsed.settings as Partial<OwnerCalendarSettings> : {};
    return {
      settings: {
        weekdays: Array.isArray(settings.weekdays) ? settings.weekdays.filter(day => Number.isInteger(day) && day >= 1 && day <= 7) : [...defaultOwnerCalendar.weekdays],
        opensAt: typeof settings.opensAt === 'string' ? settings.opensAt : defaultOwnerCalendar.opensAt,
        closesAt: typeof settings.closesAt === 'string' ? settings.closesAt : defaultOwnerCalendar.closesAt,
        blockedDates: Array.isArray(settings.blockedDates) ? settings.blockedDates.filter(date => typeof date === 'string') : [],
      },
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings.filter(validBooking) : [],
    };
  } catch {
    return { settings: { ...defaultOwnerCalendar, weekdays: [...defaultOwnerCalendar.weekdays], blockedDates: [] }, bookings: [] };
  }
}

function writeOwnerCalendar(state: OwnerCalendarState) {
  storage()?.setItem(ownerCalendarStorageKey, JSON.stringify(state));
  notifyCalendarChanged();
}

export function saveOwnerCalendarBookings(bookings: CalendarBooking[]) {
  const current = readOwnerCalendar();
  const customerBookings = current.bookings.filter(booking => booking.source === 'customer');
  writeOwnerCalendar({ ...current, bookings: [...bookings.map(booking => ({ ...booking, source: 'owner' as const })), ...customerBookings] });
}

export function saveCustomerCalendarBooking(booking: CalendarBooking) {
  const current = readOwnerCalendar();
  const next = current.bookings.filter(item => item.id !== booking.id);
  // Until a customer selects a resource, the owner's calendar treats a new
  // request as a global hold. The final booking step still validates the
  // concrete driver and vehicle before accepting it.
  writeOwnerCalendar({ ...current, bookings: [...next, { ...booking, driverId: '*', vehicleId: '*', source: 'customer' }] });
}

export function removeCustomerCalendarBooking(id: string) {
  const current = readOwnerCalendar();
  writeOwnerCalendar({ ...current, bookings: current.bookings.filter(item => item.id !== id) });
}

function minutes(value: string, allowEndOfDay = false) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return NaN;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (mins > 59 || hours > (allowEndOfDay ? 24 : 23) || (hours === 24 && mins !== 0)) return NaN;
  return hours * 60 + mins;
}

function localSlot(date: string, time: string, durationMinutes: number) {
  const start = DateTime.fromISO(`${date}T${time}`, { zone: ownerCalendarZone });
  if (!start.isValid || start.toFormat("yyyy-MM-dd'T'HH:mm") !== `${date}T${time}` || start.getPossibleOffsets().length !== 1) return null;
  return { start, end: start.plus({ minutes: durationMinutes }) };
}

function isBlocking(booking: CalendarBooking) {
  return !['cancelled', 'expired', 'declined'].includes(booking.status ?? '');
}

function resourceMatches(booking: CalendarBooking, resource: CalendarResource) {
  return booking.driverId === '*' || booking.vehicleId === '*' || booking.driverId === resource.driverId || booking.vehicleId === resource.vehicleId;
}

function fitsOwnerHours(start: DateTime, end: DateTime, settings: OwnerCalendarSettings) {
  const startMinutes = minutes(settings.opensAt);
  const closeMinutes = minutes(settings.closesAt, true);
  if (!Number.isInteger(startMinutes) || !Number.isInteger(closeMinutes)) return false;
  if (!settings.weekdays.includes(start.weekday) || settings.blockedDates.includes(start.toISODate()!)) return false;
  if (startMinutes === 0 && closeMinutes === 1440) return true;
  const localStart = start.hour * 60 + start.minute;
  const localEnd = end.toISODate() === start.toISODate() ? end.hour * 60 + end.minute : 1440 + end.hour * 60 + end.minute;
  return localStart >= startMinutes && localEnd <= closeMinutes;
}

export function isCustomerSlotAvailable(
  date: string,
  time: string,
  serviceDurationMinutes: number,
  bookings: CalendarBooking[],
  settings: OwnerCalendarSettings = defaultOwnerCalendar,
  resources: CalendarResource[] = defaultResources,
) {
  const duration = Math.max(60, Math.ceil(serviceDurationMinutes));
  const slot = localSlot(date, time, duration);
  if (!slot || !fitsOwnerHours(slot.start, slot.end, settings)) return false;
  const startMs = slot.start.toMillis();
  const endMs = slot.end.toMillis();
  return resources.some(resource => bookings.every(booking => {
    if (!isBlocking(booking) || !resourceMatches(booking, resource)) return true;
    const bookingStart = DateTime.fromISO(booking.startsAt).toMillis();
    const bookingEnd = DateTime.fromISO(booking.endsAt).toMillis();
    if (!Number.isFinite(bookingStart) || !Number.isFinite(bookingEnd)) return false;
    return startMs >= bookingEnd + customerCalendarBufferMinutes * 60_000
      || endMs + customerCalendarBufferMinutes * 60_000 <= bookingStart;
  }));
}

export function availableCustomerTimes(
  date: string,
  serviceDurationMinutes: number,
  bookings: CalendarBooking[],
  settings?: OwnerCalendarSettings,
  resources?: CalendarResource[],
) {
  return Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`)
    .filter(time => isCustomerSlotAvailable(date, time, serviceDurationMinutes, bookings, settings, resources));
}
