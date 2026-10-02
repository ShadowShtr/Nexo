import { DateTime } from 'luxon';

export const demoTimeZone = 'Europe/Lisbon';

function validDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = DateTime.fromISO(value, { zone: demoTimeZone });
  return parsed.isValid && parsed.toISODate() === value;
}

export function demoToday(now = new Date()) {
  const configured = import.meta.env.VITE_DEMO_DATE;
  if (validDate(configured)) return configured;
  const override = new URLSearchParams(window.location.search).get('demoDate');
  if (validDate(override)) return override;
  return DateTime.fromJSDate(now, { zone: demoTimeZone }).toISODate()!;
}

export function demoDateOffset(days: number, base = demoToday()) {
  return DateTime.fromISO(base, { zone: demoTimeZone }).plus({ days }).toISODate()!;
}

export function demoNowIso(now = new Date()) {
  const configured = validDate(import.meta.env.VITE_DEMO_DATE) || validDate(new URLSearchParams(window.location.search).get('demoDate'));
  const current = configured
    ? DateTime.fromISO(`${demoToday(now)}T08:00`, { zone: demoTimeZone })
    : DateTime.fromJSDate(now, { zone: demoTimeZone });
  return current.toUTC().toISO()!;
}

export function demoDateTime(days = 2, time = '10:00') {
  return `${demoDateOffset(days)}T${time}`;
}

export function demoScenarioLabel(locale: 'pt' | 'en' = 'pt') {
  const from = DateTime.fromISO(demoDateOffset(1), { zone: demoTimeZone });
  const to = DateTime.fromISO(demoDateOffset(3), { zone: demoTimeZone });
  const format = (date: DateTime) => new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: demoTimeZone,
  }).format(date.toJSDate());
  return `${format(from)}–${format(to)}`;
}
