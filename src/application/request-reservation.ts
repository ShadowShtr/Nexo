import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { preparedRequestSchema, type Actor, type Receipt } from '../contracts/reservation.ts';
import { checkSchedule, type Allocation } from '../domain/calendar.ts';
import type { UnitOfWork } from './reservation-ports.ts';

export class ReservationConflict extends Error {
  readonly conflicts: ReturnType<typeof checkSchedule>['conflicts'];
  constructor(conflicts: ReturnType<typeof checkSchedule>['conflicts']) { super('Reservation conflicts with resource schedule'); this.conflicts=conflicts; }
}
/** Internal persistence proof for a server-prepared quote, NOT a public booking endpoint.
 * Route estimates must be prepared beforehand by trusted infrastructure. No HTTP inside locks.
 * Working windows, capacity, lead-time, association and quote origin are future orchestration guards.
 */
export async function requestReservation(uow: UnitOfWork, actor: Actor, input: unknown,
  relocation: (from: Allocation, to: Allocation) => number | undefined): Promise<Receipt> {
  z.object({ organizationId: z.uuid(), userId: z.uuid() }).strict().parse(actor);
  const request = preparedRequestSchema.parse(input);
  const hash = createHash('sha256').update(JSON.stringify(request)).digest('hex');
  return uow.run(actor.organizationId, async tx => {
    await tx.authorizeOwner(actor);
    const replay = await tx.claimCommand(request.idempotencyKey, hash);
    if (replay) return replay;
    await tx.lockResources(request.driverId, request.vehicleId);
    const rules = await tx.rules();
    // Read the DB clock after locks: waiting must not preserve expired holds.
    const now = await tx.now();
    const expiresAt = new Date(Date.parse(now) + 30 * 60000).toISOString();
    const receipt: Receipt = { id: randomUUID(), expiresAt, status: 'requested', version: 1 };
    const candidate: Allocation = { id: receipt.id, driverId: request.driverId, vehicleId: request.vehicleId,
      startsAt: request.startsAt, endsAt: request.endsAt, status: 'requested', holdExpiresAt: expiresAt };
    const result = checkSchedule(candidate, await tx.allocations(request.driverId, request.vehicleId), now, rules, relocation);
    if (!result.available) throw new ReservationConflict(result.conflicts);
    await tx.insert(request, receipt, rules);
    await tx.completeCommand(request.idempotencyKey, receipt);
    return receipt;
  });
}
