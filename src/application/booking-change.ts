import { z } from 'zod';
import { transition, type BookingStatus } from '../domain/booking.ts';
import { changeEligibility } from '../domain/policy.ts';
import { instant } from '../domain/validation.ts';

const uuid = z.uuid();
const customerToken = z.string().trim().min(16).max(200);

export type ChangeActor = {
  userId?: string;
  organizationId: string;
  role: 'customer' | 'owner' | 'driver';
  active: boolean;
};

export type ChangeBooking = {
  id: string;
  organizationId: string;
  customerId: string;
  driverUserId: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  originalStartsAt: string;
  depositPaidCents: number;
  totalPaidCents: number;
  version: number;
};

const common = z.object({ bookingId: uuid, expectedVersion: z.number().int().min(1), reason: z.string().trim().max(1000).optional() }).strict();
export const cancellationSchema = common.extend({ customerToken: customerToken.optional() }).strict();
export const rescheduleSchema = common.extend({
  customerToken: customerToken.optional(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  idempotencyKey: z.string().trim().min(16).max(200),
}).strict().refine(value => instant(value.endsAt) > instant(value.startsAt), 'Novo intervalo inválido');
export type CancellationCommand = z.infer<typeof cancellationSchema>;
export type RescheduleCommand = z.infer<typeof rescheduleSchema>;

export interface BookingChangeGateway {
  getBooking(input: { organizationId: string; bookingId: string }): Promise<ChangeBooking | null>;
  authorizeCustomer(input: { organizationId: string; bookingId: string; token: string }): Promise<boolean>;
  cancel(input: CancellationCommand & { organizationId: string; actorUserId?: string; refundCents: number; refundReason: 'customer_eligible' | 'customer_ineligible' | 'driver_cancelled' | 'owner_override' }): Promise<{ id: string; status: 'cancelled'; version: number; refundCents: number }>;
  prepareQuoteForReschedule(input: { organizationId: string; bookingId: string; startsAt: string; endsAt: string }): Promise<{ quoteId: string }>;
  checkAvailability(input: { organizationId: string; bookingId: string; driverUserId: string; startsAt: string; endsAt: string }): Promise<{ available: boolean }>;
  createRescheduleProposal(input: RescheduleCommand & { organizationId: string; actorUserId?: string; originalStartsAt: string; quoteId: string }): Promise<{ id: string; status: 'proposed'; version: number; quoteId: string }>;
}

async function loadAndAuthorize(actor: ChangeActor, bookingId: string, gateway: BookingChangeGateway, customerTokenValue?: string) {
  if (!actor.active) throw new Error('FORBIDDEN');
  const booking = await gateway.getBooking({ organizationId: actor.organizationId, bookingId });
  if (!booking || booking.organizationId !== actor.organizationId) throw new Error('NOT_FOUND');
  if (actor.role === 'driver' && actor.userId !== booking.driverUserId) throw new Error('FORBIDDEN');
  if (actor.role === 'customer') {
    if (!customerTokenValue || !(await gateway.authorizeCustomer({ organizationId: actor.organizationId, bookingId, token: customerTokenValue }))) throw new Error('FORBIDDEN');
  }
  return booking;
}

export async function cancelBooking(actor: ChangeActor, input: unknown, gateway: BookingChangeGateway, now = () => new Date().toISOString()) {
  const command = cancellationSchema.parse(input);
  const booking = await loadAndAuthorize(actor, command.bookingId, gateway, command.customerToken);
  if (booking.version !== command.expectedVersion) throw new Error('STALE_VERSION');
  transition(booking.status, 'cancelled');
  const eligibility = changeEligibility(now(), booking.startsAt, booking.originalStartsAt);
  const refundReason = actor.role === 'driver' ? 'driver_cancelled' : actor.role === 'owner' ? 'owner_override' : eligibility.refundEligible ? 'customer_eligible' : 'customer_ineligible';
  const refundCents = actor.role === 'driver' ? booking.totalPaidCents : actor.role === 'owner' ? booking.totalPaidCents : eligibility.refundEligible ? booking.depositPaidCents : 0;
  return gateway.cancel({ ...command, organizationId: actor.organizationId, actorUserId: actor.userId, refundCents, refundReason });
}

export async function proposeReschedule(actor: ChangeActor, input: unknown, gateway: BookingChangeGateway, now = () => new Date().toISOString()) {
  const command = rescheduleSchema.parse(input);
  if (actor.role === 'driver') throw new Error('CUSTOMER_OR_OWNER_REQUIRED');
  const booking = await loadAndAuthorize(actor, command.bookingId, gateway, command.customerToken);
  if (booking.version !== command.expectedVersion) throw new Error('STALE_VERSION');
  const eligibility = changeEligibility(now(), booking.startsAt, booking.originalStartsAt);
  if (!eligibility.rescheduleEligible) throw new Error('OUTSIDE_CHANGE_WINDOW');
  if (instant(command.startsAt) <= instant(now())) throw new Error('NEW_START_IN_PAST');
  const quote = await gateway.prepareQuoteForReschedule({ organizationId: actor.organizationId, bookingId: booking.id, startsAt: command.startsAt, endsAt: command.endsAt });
  const availability = await gateway.checkAvailability({ organizationId: actor.organizationId, bookingId: booking.id, driverUserId: booking.driverUserId, startsAt: command.startsAt, endsAt: command.endsAt });
  if (!availability.available) throw new Error('RESCHEDULE_CONFLICT');
  return gateway.createRescheduleProposal({ ...command, organizationId: actor.organizationId, actorUserId: actor.userId, originalStartsAt: booking.originalStartsAt, quoteId: quote.quoteId });
}
