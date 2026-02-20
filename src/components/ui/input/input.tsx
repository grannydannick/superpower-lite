import { cva, VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

/*
 * Note here: if adding anything lower than text-base it creates weird zoom effect on safari
 * */

const inputVariants = cva(
  'flex w-full rounded-xl border px-6 py-4 text-base shadow-sm transition-all duration-150 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-input bg-white caret-vermillion-900 placeholder:text-muted-foreground focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring',
        glass:
          'border-white/20 bg-white/5 text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white',
        error:
          'border-pink-700 bg-pink-50 caret-vermillion-900 transition-none duration-0 placeholder:text-pink-700 focus-within:ring-1 focus-within:ring-pink-700 focus-visible:bg-pink-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface InputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
