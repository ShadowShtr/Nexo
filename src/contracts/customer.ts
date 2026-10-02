import { z } from 'zod';

export const customerDraft = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30).refine(value => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }),
  nif: z.string().trim().regex(/^[1-9]\d{8}$/).refine(value => {
    const digits = [...value].map(Number);
    const check = 11 - digits.slice(0, 8).reduce((sum, digit, index) => sum + digit * (9 - index), 0) % 11;
    return digits[8] === (check > 9 ? 0 : check);
  }),
  notes: z.string().trim().max(2000).default(''),
});
export type CustomerDraft = z.infer<typeof customerDraft>;
export const isCustomerPublishable = (input: unknown) => customerDraft.safeParse(input).success;
