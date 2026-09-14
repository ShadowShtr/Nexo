import { z } from 'zod';

export const tourDraft = z.object({
  namePt: z.string().trim().min(1).max(120), nameEn: z.string().trim().min(1).max(120),
  descriptionPt: z.string().trim().min(1).max(2000), descriptionEn: z.string().trim().min(1).max(2000),
  durationDays: z.literal(2), baseCents: z.number().int().min(0).max(100000000),
  extraPassengerCents: z.number().int().min(0).max(100000000), minimumNoticeHours: z.number().int().min(48).max(8760),
});
export type TourDraft = z.infer<typeof tourDraft>;
export const isTourPublishable = (input: unknown) => tourDraft.safeParse(input).success;
