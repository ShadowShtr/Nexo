import { DateTime } from 'luxon';
import type { Allocation } from '../domain/calendar.ts';

type DemoTrip = { id: string; driver: number; car: number; day: string; time: string; end: string };

export function demoTripAllocation(trip: DemoTrip): Allocation {
  const instant = (time: string) => {
    const value = DateTime.fromISO(`${trip.day}T${time}`, { zone: 'Europe/Lisbon' });
    if (!value.isValid || value.toFormat('HH:mm') !== time || value.getPossibleOffsets().length !== 1) {
      throw new Error('Invalid or ambiguous demo trip time');
    }
    return value.toUTC().toISO()!;
  };
  return { id: trip.id, driverId: String(trip.driver), vehicleId: String(trip.car), startsAt: instant(trip.time), endsAt: instant(trip.end), status: 'confirmed' };
}
