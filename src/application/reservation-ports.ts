import type { Allocation, CalendarRules } from '../domain/calendar.ts';
import type { Actor, PreparedRequest, Receipt } from '../contracts/reservation.ts';
export interface ReservationTransaction {
  authorizeOwner(actor: Actor): Promise<void>;
  claimCommand(key: string, hash: string): Promise<Receipt | null>;
  lockResources(driverId: string, vehicleId: string): Promise<void>;
  rules(): Promise<CalendarRules & { version: number }>;
  now(): Promise<string>;
  allocations(driverId: string, vehicleId: string): Promise<Allocation[]>;
  insert(request: PreparedRequest, receipt: Receipt, rules: CalendarRules & { version: number }): Promise<void>;
  completeCommand(key: string, receipt: Receipt): Promise<void>;
}
export interface UnitOfWork {
  run<T>(organizationId: string, action: (tx: ReservationTransaction) => Promise<T>): Promise<T>;
}
