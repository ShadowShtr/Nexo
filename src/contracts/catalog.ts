import { z } from 'zod';

const nonEmpty = (max:number) => z.string().trim().min(1).max(max);
export const driverDraft = z.object({
  displayName: nonEmpty(120), displayNameEn: nonEmpty(120), biographyPt: nonEmpty(2000), biographyEn: nonEmpty(2000),
  phone: z.string().trim().min(7).max(30), photoPath: nonEmpty(500), languages: z.array(z.enum(['pt-PT','en'])).min(1),
});
export const vehicleDraft = z.object({
  registration: z.string().trim().min(2).max(20), make: nonEmpty(80), model: nonEmpty(80), passengerCapacity: z.number().int().min(1).max(20),
  luggageCapacity: z.number().int().min(0).max(30), minimumNoticeHours: z.number().int().min(0).max(8760), supplementCents: z.number().int().min(0).max(100000000),
});
export type DriverDraft = z.infer<typeof driverDraft>;
export type VehicleDraft = z.infer<typeof vehicleDraft>;
export const isDriverPublishable = (input:unknown) => driverDraft.safeParse(input).success;
export const isVehiclePublishable = (input:unknown) => vehicleDraft.safeParse(input).success;
export const canCarryPassengers = (capacity:number,passengers:number) => Number.isInteger(capacity) && Number.isInteger(passengers) && capacity >= 1 && passengers >= 1 && passengers <= capacity;
