import type { ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
// Local CSS adaptation of the shadcn/ui Radix button composition (MIT).
const variants = cva('pm-button', { variants: { variant: { primary: 'pm-button-primary', secondary: 'pm-button-secondary', ghost: 'pm-button-ghost' } }, defaultVariants: { variant: 'primary' } });
export function Button({ asChild = false, variant, className, ...props }: ComponentProps<'button'> & VariantProps<typeof variants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : 'button';
  return <Component {...(!asChild ? { type: 'button' as const } : {})} {...props} className={variants({ variant, className })} />;
}
