import { z } from 'zod';
import { quote, type Line } from '../domain/pricing.ts';
import { instant } from '../domain/validation.ts';

const uuid = z.uuid();
const point = z.object({
  label: z.string().trim().min(1).max(240),
  latitude: z.number().finite().min(-90).max(90).optional(),
  longitude: z.number().finite().min(-180).max(180).optional(),
}).strict().refine(value => (value.latitude === undefined) === (value.longitude === undefined), 'Coordenadas incompletas');

export const quoteRequestSchema = z.object({
  driverId: uuid,
  vehicleId: uuid,
  serviceKind: z.enum(['transfer', 'tour']),
  passengers: z.number().int().min(1).max(20),
  pickup: point,
  stops: z.array(point).max(6).default([]),
  destination: point,
  startsAt: z.iso.datetime({ offset: true }),
  customerId: uuid.optional(),
}).strict();

const pricingLine = z.object({ code: z.string().trim().min(1).max(80), cents: z.number().int().min(0) }).strict();
const pricingConfig = z.object({
  passengerCapacity: z.number().int().min(1).max(20),
  baseCents: z.number().int().min(0),
  centsPerKm: z.number().int().min(0),
  extraPassengerCents: z.number().int().min(0),
  nightSurchargeBps: z.number().int().min(0).max(10000),
  extras: z.array(pricingLine).max(30).default([]),
  tariffVersion: z.number().int().positive(),
  validityMinutes: z.number().int().min(1).max(120),
}).strict();

const routeEstimate = z.object({
  provider: z.string().trim().min(1).max(80),
  distanceMeters: z.number().int().min(1).max(2_000_000),
  durationMinutes: z.number().int().min(1).max(24 * 60),
}).strict();

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type PricingConfig = z.infer<typeof pricingConfig>;
export type RouteEstimate = z.infer<typeof routeEstimate>;
export type QuoteActor = { organizationId: string };
export type QuoteSnapshotCommand = {
  organizationId: string;
  customerId?: string;
  driverId: string;
  vehicleId: string;
  settingsVersion: number;
  serviceKind: QuoteRequest['serviceKind'];
  route: { points: QuoteRequest['pickup' | 'destination'][]; stops: QuoteRequest['stops']; estimate: RouteEstimate };
  lines: Line[];
  totalCents: number;
  depositCents: number;
  balanceCents: number;
  validUntil: string;
};

export interface QuotePreparationGateway {
  resolvePricing(input: { organizationId: string; driverId: string; vehicleId: string; serviceKind: QuoteRequest['serviceKind']; startsAt: string }): Promise<PricingConfig>;
  saveSnapshot(input: QuoteSnapshotCommand): Promise<{ id: string; validUntil: string }>;
}

export interface RouteProvider {
  estimate(input: { serviceKind: QuoteRequest['serviceKind']; points: QuoteSnapshotCommand['route']['points'] }): Promise<RouteEstimate | null>;
}

function assertActor(actor: QuoteActor) {
  if (!uuid.safeParse(actor.organizationId).success) throw new Error('INVALID_ORGANIZATION');
}

/** Resolves a quote from trusted server-side pricing and routing data. Browser totals are never accepted. */
export async function prepareQuote(actor: QuoteActor, input: unknown, gateway: QuotePreparationGateway, routes: RouteProvider, now = () => new Date().toISOString()) {
  assertActor(actor);
  const request = quoteRequestSchema.parse(input);
  const points = [request.pickup, ...request.stops, request.destination];
  const estimateResult = await routes.estimate({ serviceKind: request.serviceKind, points });
  if (!estimateResult) throw new Error('ROUTE_UNAVAILABLE');
  const estimate = routeEstimate.parse(estimateResult);
  const config = pricingConfig.parse(await gateway.resolvePricing({ organizationId: actor.organizationId, driverId: request.driverId, vehicleId: request.vehicleId, serviceKind: request.serviceKind, startsAt: request.startsAt }));
  const calculated = quote({
    passengers: request.passengers,
    passengerCapacity: config.passengerCapacity,
    service: request.serviceKind === 'transfer'
      ? { kind: 'transfer', baseCents: config.baseCents, distanceMeters: estimate.distanceMeters, centsPerKm: config.centsPerKm }
      : { kind: 'tour', baseCents: config.baseCents, extraPassengerCents: config.extraPassengerCents },
    nightSurchargeBps: config.nightSurchargeBps,
    extras: config.extras,
  });
  const createdAtMs = instant(now());
  const validUntil = new Date(createdAtMs + config.validityMinutes * 60_000).toISOString();
  const snapshot: QuoteSnapshotCommand = {
    organizationId: actor.organizationId,
    ...(request.customerId ? { customerId: request.customerId } : {}),
    driverId: request.driverId,
    vehicleId: request.vehicleId,
    settingsVersion: config.tariffVersion,
    serviceKind: request.serviceKind,
    route: { points, stops: request.stops, estimate },
    lines: calculated.lines,
    totalCents: calculated.totalCents,
    depositCents: calculated.depositCents,
    balanceCents: calculated.balanceCents,
    validUntil,
  };
  const saved = await gateway.saveSnapshot(snapshot);
  return { id: saved.id, validUntil: saved.validUntil, quote: calculated, route: estimate, settingsVersion: config.tariffVersion };
}
