import { cva, VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const textAreaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border text-base ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-input bg-background px-6 py-4 caret-vermillion-900 placeholder:text-muted-foreground focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-ring',
        glass:
          'border-white/20 bg-white/5 p-4 text-white caret-white placeholder:text-white placeholder:opacity-50 focus:border-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textAreaVariants> {}

/*
 * Note here: if adding anything lower than text-base it creates weird zoom effect on safari
 * */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textAreaVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
