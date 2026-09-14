import { z } from 'zod';

/** Código curto exibido ao cliente; a busca real deverá exigir também um fator adicional. */
export const bookingReferenceSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{6,30}$/);
export type BookingReference = z.infer<typeof bookingReferenceSchema>;
export const normalizeBookingReference = (input: unknown): BookingReference | null => {
  const parsed = bookingReferenceSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
};
