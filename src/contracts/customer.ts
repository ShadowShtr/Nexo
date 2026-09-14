import { z } from 'zod';

export const customerDraft = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  nif: z.string().trim().regex(/^\d{9}$/),
  notes: z.string().trim().max(2000).default(''),
});
export type CustomerDraft = z.infer<typeof customerDraft>;
export const isCustomerPublishable = (input: unknown) => customerDraft.safeParse(input).success;
