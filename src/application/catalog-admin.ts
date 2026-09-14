import { z } from 'zod';
import { instant } from '../domain/validation.ts';
import { driverDraft, vehicleDraft, type DriverDraft, type VehicleDraft } from '../contracts/catalog.ts';

export type CatalogActor = {
  userId: string;
  organizationId: string;
  role: 'owner' | 'driver';
  active: boolean;
};

const id = z.uuid();
const status = z.enum(['draft', 'active', 'inactive', 'maintenance']);

export const driverCommandSchema = driverDraft.extend({
  id: id.optional(),
  status: z.enum(['draft', 'active', 'inactive']).default('draft'),
  publishedAt: z.iso.datetime({ offset: true }).nullable().optional(),
}).strict();

export const vehicleCommandSchema = vehicleDraft.extend({
  id: id.optional(),
  amenities: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  status: status.default('draft'),
}).strict();

export const assignmentCommandSchema = z.object({
  id: id.optional(),
  driverUserId: id,
  vehicleId: id,
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable().optional(),
}).strict().refine(value => !value.endsAt || instant(value.endsAt) > instant(value.startsAt), 'Janela de associação inválida');

export type DriverCommand = z.infer<typeof driverCommandSchema>;
export type VehicleCommand = z.infer<typeof vehicleCommandSchema>;
export type AssignmentCommand = z.infer<typeof assignmentCommandSchema>;
export type AssignmentWindow = Pick<AssignmentCommand, 'driverUserId' | 'vehicleId' | 'startsAt' | 'endsAt'> & { id?: string };

export interface CatalogAdminGateway {
  saveDriver(input: DriverCommand & { organizationId: string }): Promise<{ id: string }>;
  saveVehicle(input: VehicleCommand & { organizationId: string }): Promise<{ id: string }>;
  listAssignments(input: { organizationId: string; driverUserId: string; vehicleId: string }): Promise<AssignmentWindow[]>;
  saveAssignment(input: AssignmentCommand & { organizationId: string }): Promise<{ id: string }>;
}

function authorize(actor: CatalogActor) {
  if (!actor.active || actor.role !== 'owner') throw new Error('FORBIDDEN');
  if (!actor.userId || !actor.organizationId) throw new Error('INVALID_ACTOR');
}

/** Returns true when two association windows share at least one instant. */
export function assignmentWindowsOverlap(a: AssignmentWindow, b: AssignmentWindow): boolean {
  const aStart = instant(a.startsAt);
  const bStart = instant(b.startsAt);
  const aEnd = a.endsAt ? instant(a.endsAt) : Number.POSITIVE_INFINITY;
  const bEnd = b.endsAt ? instant(b.endsAt) : Number.POSITIVE_INFINITY;
  return aStart < bEnd && bStart < aEnd;
}

/** Checks both resources: a driver and a vehicle cannot have two active associations. */
export function assertAssignmentAvailable(candidate: AssignmentWindow, existing: AssignmentWindow[]) {
  for (const item of existing) {
    if (item.id && candidate.id && item.id === candidate.id) continue;
    const sameResource = item.driverUserId === candidate.driverUserId || item.vehicleId === candidate.vehicleId;
    if (sameResource && assignmentWindowsOverlap(candidate, item)) throw new Error('ASSIGNMENT_CONFLICT');
  }
}

export async function saveDriver(actor: CatalogActor, input: unknown, gateway: CatalogAdminGateway, now = () => new Date().toISOString()) {
  authorize(actor);
  const parsed = driverCommandSchema.parse(input);
  const publishedAt = parsed.status === 'active' ? (parsed.publishedAt ?? now()) : (parsed.publishedAt ?? null);
  return gateway.saveDriver({ ...parsed, publishedAt, organizationId: actor.organizationId });
}

export async function saveVehicle(actor: CatalogActor, input: unknown, gateway: CatalogAdminGateway) {
  authorize(actor);
  const parsed = vehicleCommandSchema.parse(input);
  return gateway.saveVehicle({ ...parsed, organizationId: actor.organizationId });
}

export async function saveAssignment(actor: CatalogActor, input: unknown, gateway: CatalogAdminGateway) {
  authorize(actor);
  const parsed = assignmentCommandSchema.parse(input);
  const existing = await gateway.listAssignments({ organizationId: actor.organizationId, driverUserId: parsed.driverUserId, vehicleId: parsed.vehicleId });
  assertAssignmentAvailable(parsed, existing);
  return gateway.saveAssignment({ ...parsed, organizationId: actor.organizationId });
}

export type { DriverDraft, VehicleDraft };
