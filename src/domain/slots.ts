import { DateTime } from 'luxon';
import { instant, integer } from './validation.ts';

export type WorkingWindow = { weekday: number; startsAt: string; endsAt: string };
export type SlotRules = {
  zone: string;
  slotMinutes: number;
  serviceDurationMinutes: number;
  minimumLeadMinutes: number;
  horizonDays: number;
  fromDate: string;
  now: string;
  windows: WorkingWindow[];
  blockedDates?: string[];
};
export type ServiceSlot = { startsAt: string; endsAt: string; localDate: string; localTime: string };

function localDate(value: string, zone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Data local inválida');
  const parsed = DateTime.fromISO(value, { zone });
  if (!parsed.isValid || parsed.toFormat('yyyy-MM-dd') !== value) throw new Error('Data local inválida');
  return parsed.startOf('day');
}

function localTime(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Hora local inválida');
  return value;
}

/** Converts a local wall-clock time only when it maps to one exact instant. */
export function localWallClock(date: string, time: string, zone: string): DateTime {
  localTime(time);
  const day = localDate(date, zone);
  const value = DateTime.fromISO(`${date}T${time}`, { zone });
  if (!value.isValid || value.toFormat('yyyy-MM-dd\'T\'HH:mm') !== `${date}T${time}`) throw new Error('Hora inexistente neste fuso');
  if (value.getPossibleOffsets().length !== 1) throw new Error('Hora ambígua neste fuso');
  return value;
}

function validateWindow(window: WorkingWindow) {
  integer(window.weekday, 'dia da semana', 1);
  if (window.weekday > 7) throw new RangeError('Dia da semana inválido');
  localTime(window.startsAt); localTime(window.endsAt);
  if (window.startsAt >= window.endsAt) throw new RangeError('Janela deve terminar depois de começar');
}

/** Generates local slots without ever truncating the requested service duration. */
export function generateSlots(rules: SlotRules): ServiceSlot[] {
  integer(rules.slotMinutes, 'passo', 1); integer(rules.serviceDurationMinutes, 'duração', 1); integer(rules.minimumLeadMinutes, 'antecedência'); integer(rules.horizonDays, 'horizonte', 1);
  const zoneCheck = DateTime.now().setZone(rules.zone);
  if (!zoneCheck.isValid) throw new Error('Fuso horário inválido');
  const nowMs = instant(rules.now);
  const thresholdMs = nowMs + rules.minimumLeadMinutes * 60_000;
  const startDay = localDate(rules.fromDate, rules.zone);
  const blocked = new Set(rules.blockedDates ?? []);
  for (const date of blocked) localDate(date, rules.zone);
  const windows = rules.windows.map(window => { validateWindow(window); return window; });
  const result: ServiceSlot[] = [];
  for (let dayIndex = 0; dayIndex < rules.horizonDays; dayIndex += 1) {
    const day = startDay.plus({ days: dayIndex });
    const date = day.toFormat('yyyy-MM-dd');
    if (blocked.has(date)) continue;
    const dayWindows = windows.filter(window => window.weekday === day.weekday);
    for (const window of dayWindows) {
      const windowStart = localWallClock(date, window.startsAt, rules.zone);
      const windowEnd = localWallClock(date, window.endsAt, rules.zone);
      for (let cursor = windowStart; ; cursor = cursor.plus({ minutes: rules.slotMinutes })) {
        const end = cursor.plus({ minutes: rules.serviceDurationMinutes });
        if (end.toMillis() > windowEnd.toMillis()) break;
        if (cursor.toMillis() >= thresholdMs) {
          result.push({ startsAt: cursor.toUTC().toISO()!, endsAt: end.toUTC().toISO()!, localDate: date, localTime: cursor.toFormat('HH:mm') });
        }
      }
    }
  }
  return result.sort((a, b) => instant(a.startsAt) - instant(b.startsAt));
}
