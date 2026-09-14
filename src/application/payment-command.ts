import { z } from 'zod';
import { paymentLedgerSummary, type PaymentEntry, type PaymentPhase } from '../domain/payment-ledger.ts';

const uuid = z.uuid();
const paymentCommandSchema = z.object({
  bookingId: uuid,
  phase: z.enum(['deposit', 'balance', 'extra']),
  direction: z.enum(['charge', 'refund']),
  amountCents: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  currency: z.literal('EUR'),
  providerReference: z.string().trim().min(6).max(200),
  idempotencyKey: z.string().trim().min(16).max(200),
  recordedAt: z.iso.datetime({ offset: true }),
}).strict();

export type PaymentCommand = z.infer<typeof paymentCommandSchema>;
export type PaymentActor = { organizationId: string; verifiedWebhook: boolean };
export type PaymentContext = { organizationId: string; driverUserId: string; expectedCents: number; currency: 'EUR' };
export interface PaymentLedgerGateway {
  context(input: { organizationId: string; bookingId: string; phase: PaymentPhase; direction: PaymentCommand['direction'] }): Promise<PaymentContext | null>;
  findByIdempotency(input: { organizationId: string; idempotencyKey: string }): Promise<PaymentEntry | null>;
  listEntries(input: { organizationId: string; bookingId: string }): Promise<PaymentEntry[]>;
  append(input: PaymentEntry & { organizationId: string }): Promise<PaymentEntry>;
}

/** Records a signature-verified provider event. Beneficiary and expected amount come from the server context. */
export async function recordPaymentEvent(actor: PaymentActor, input: unknown, gateway: PaymentLedgerGateway) {
  if (!actor.verifiedWebhook) throw new Error('WEBHOOK_UNVERIFIED');
  const command = paymentCommandSchema.parse(input);
  const duplicate = await gateway.findByIdempotency({ organizationId: actor.organizationId, idempotencyKey: command.idempotencyKey });
  if (duplicate) return { entry: duplicate, duplicate: true };
  const context = await gateway.context({ organizationId: actor.organizationId, bookingId: command.bookingId, phase: command.phase, direction: command.direction });
  if (!context || context.organizationId !== actor.organizationId) throw new Error('NOT_FOUND');
  const amountAccepted = command.direction === 'charge' ? command.amountCents === context.expectedCents : command.amountCents <= context.expectedCents;
  if (command.currency !== context.currency || !amountAccepted) throw new Error('AMOUNT_MISMATCH');
  const entries = await gateway.listEntries({ organizationId: actor.organizationId, bookingId: command.bookingId });
  if (command.direction === 'refund') {
    const summary = paymentLedgerSummary(entries).byBooking.get(command.bookingId);
    if (!summary || command.amountCents > summary.refundableCents) throw new Error('REFUND_EXCEEDS_RECEIVED');
  }
  const entry: PaymentEntry & { organizationId: string } = {
    ...command,
    id: crypto.randomUUID(),
    driverUserId: context.driverUserId,
    organizationId: actor.organizationId,
  };
  return { entry: await gateway.append(entry), duplicate: false };
}
