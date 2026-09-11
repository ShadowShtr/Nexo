import { z } from 'zod';
import { paymentSplit } from '../domain/pricing.ts';

const cents = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const preparedRequestSchema = z.object({
  idempotencyKey: z.string().min(8).max(100),
  driverId: z.uuid(), vehicleId: z.uuid(),
  startsAt: z.iso.datetime({ offset: true }), endsAt: z.iso.datetime({ offset: true }),
  quote: z.object({ totalCents: cents, depositCents: cents, balanceCents: cents, tariffVersion: z.number().int().positive() }).strict()
    .refine(q => { const expected = paymentSplit(q.totalCents); return q.depositCents === expected.depositCents && q.balanceCents === expected.balanceCents; }, 'Invalid quote split'),
}).strict().refine(v => Date.parse(v.endsAt) > Date.parse(v.startsAt), 'Invalid interval');
export type PreparedRequest = z.infer<typeof preparedRequestSchema>;
// Supplied by a future authenticated server, never trusted from a browser payload.
export type Actor = { organizationId: string; userId: string };
export type Receipt = { id: string; expiresAt: string; status: 'requested'; version: 1 };
