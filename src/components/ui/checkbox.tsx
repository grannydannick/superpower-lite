import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type CheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  variant?: 'default' | 'error';
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = 'default', ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border ring-offset-background data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      variant === 'error'
        ? 'border-pink-700 bg-pink-50 transition-none duration-0 focus-visible:ring-1 focus-visible:ring-pink-700'
        : 'border-primary data-[state=checked]:bg-primary focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="size-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

type AnimatedCheckboxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  variant?: 'default' | 'error';
};

const AnimatedCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  AnimatedCheckboxProps
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'group peer h-4 w-4 shrink-0 rounded-sm ring-offset-background data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'error'
          ? 'border-pink-700 bg-pink-50 transition-none duration-0 focus-visible:ring-1 focus-visible:ring-pink-700'
          : 'border-zinc-200 data-[state=checked]:bg-black focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.80859 9.38867L7.55859 13.1387L15.8086 4.88867"
            stroke="currentColor"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-data-[state=checked]:animate-dash"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 0,
            }}
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
AnimatedCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, AnimatedCheckbox };
