import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const makeEnterKeyHandler = (
  checked: boolean | undefined,
  onCheckedChange: ((checked: boolean) => void) | undefined,
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>,
): React.KeyboardEventHandler<HTMLButtonElement> => {
  return (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (typeof onCheckedChange === 'function') {
        const next = typeof checked === 'boolean' ? !checked : true;
        onCheckedChange(next);
      }
    }
    onKeyDown?.(e);
  };
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, onKeyDown, checked, onCheckedChange, ...props }, ref) => {
  const handleKeyDown = makeEnterKeyHandler(
    checked,
    onCheckedChange,
    onKeyDown,
  );

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      onKeyDown={handleKeyDown}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <Check className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const AnimatedCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, onKeyDown, checked, onCheckedChange, ...props }, ref) => {
  const handleKeyDown = makeEnterKeyHandler(
    checked,
    onCheckedChange,
    onKeyDown,
  );

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer group h-4 w-4 shrink-0 rounded-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary-foreground',
        className,
      )}
      onKeyDown={handleKeyDown}
      checked={checked}
      onCheckedChange={onCheckedChange}
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
