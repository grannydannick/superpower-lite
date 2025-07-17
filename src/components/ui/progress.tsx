import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const progressCva = cva('relative h-2 w-full overflow-hidden rounded-full', {
  variants: {
    variant: {
      dark: 'bg-primary/20',
      light: 'bg-white/20',
    },
  },
  defaultVariants: {
    variant: 'dark',
  },
});

const indicatorCva = cva('size-full flex-1 transition-all', {
  variants: {
    variant: {
      dark: 'bg-primary',
      light: 'bg-white',
    },
  },
  defaultVariants: {
    variant: 'dark',
  },
});

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressCva> {
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'dark', ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressCva({ variant }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(indicatorCva({ variant }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
