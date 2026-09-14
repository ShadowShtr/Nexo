import { z } from 'zod';
import { transition, type BookingStatus } from '../domain/booking.ts';

const uuid = z.uuid();
const bookingId = uuid;

export type BookingActor = {
  userId: string;
  organizationId: string;
  role: 'owner' | 'driver';
  active: boolean;
};

export type PaymentState = 'pending' | 'succeeded' | 'failed' | 'refund_pending' | 'partially_refunded' | 'refunded';
export type DriverAcceptance = 'pending' | 'accepted' | 'declined';
export type BookingRecord = {
  id: string;
  organizationId: string;
  driverUserId: string;
  status: BookingStatus;
  paymentState: PaymentState;
  driverAcceptance: DriverAcceptance;
  allocationGuaranteed: boolean;
  balanceRecorded: boolean;
  version: number;
};

export const bookingTransitionSchema = z.object({
  bookingId,
  next: z.enum(['awaiting_payment', 'confirmed', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled', 'declined', 'expired']),
  expectedVersion: z.number().int().min(1),
  reason: z.string().trim().max(1000).optional(),
}).strict();
export type BookingTransition = z.infer<typeof bookingTransitionSchema>;

export interface BookingCommandGateway {
  getBooking(input: { organizationId: string; bookingId: string }): Promise<BookingRecord | null>;
  transitionBooking(input: BookingTransition & { organizationId: string; actorUserId: string; driverAcceptance?: DriverAcceptance }): Promise<{ id: string; status: BookingStatus; version: number }>;
}

function authorize(actor: BookingActor, booking: BookingRecord) {
  if (!actor.active || actor.organizationId !== booking.organizationId) throw new Error('FORBIDDEN');
  if (actor.role === 'driver' && actor.userId !== booking.driverUserId) throw new Error('FORBIDDEN');
}

function requiresDriver(actor: BookingActor, booking: BookingRecord) {
  if (actor.role !== 'driver' || actor.userId !== booking.driverUserId) throw new Error('DRIVER_REQUIRED');
}

function guardTransition(actor: BookingActor, booking: BookingRecord, command: BookingTransition) {
  const next = transition(booking.status, command.next);
  if (next === 'awaiting_payment') {
    requiresDriver(actor, booking);
    if (booking.driverAcceptance !== 'pending') throw new Error('ACCEPTANCE_ALREADY_HANDLED');
  }
  if (next === 'declined') {
    requiresDriver(actor, booking);
    if (booking.driverAcceptance !== 'pending') throw new Error('ACCEPTANCE_ALREADY_HANDLED');
  }
  if (['en_route', 'arrived', 'in_progress', 'completed'].includes(next)) requiresDriver(actor, booking);
  if (next === 'confirmed') {
    if (booking.paymentState !== 'succeeded') throw new Error('PAYMENT_REQUIRED');
    if (!booking.allocationGuaranteed) throw new Error('ALLOCATION_REQUIRED');
    if (booking.driverAcceptance !== 'accepted') throw new Error('DRIVER_ACCEPTANCE_REQUIRED');
  }
  if (next === 'in_progress' && !booking.balanceRecorded) throw new Error('BALANCE_REQUIRED');
  if (next === 'cancelled' && actor.role !== 'owner' && actor.userId !== booking.driverUserId) throw new Error('FORBIDDEN');
}

/** Applies one guarded transition; the gateway must update by expectedVersion atomically. */
export async function transitionBooking(actor: BookingActor, input: unknown, gateway: BookingCommandGateway) {
  const command = bookingTransitionSchema.parse(input);
  const booking = await gateway.getBooking({ organizationId: actor.organizationId, bookingId: command.bookingId });
  if (!booking) throw new Error('NOT_FOUND');
  authorize(actor, booking);
  if (booking.version !== command.expectedVersion) throw new Error('STALE_VERSION');
  guardTransition(actor, booking, command);
  const driverAcceptance = command.next === 'awaiting_payment' ? 'accepted' : command.next === 'declined' ? 'declined' : undefined;
  return gateway.transitionBooking({ ...command, ...(driverAcceptance ? { driverAcceptance } : {}), organizationId: actor.organizationId, actorUserId: actor.userId });
}

export { guardTransition };
