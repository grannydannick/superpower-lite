import React, { ReactNode, forwardRef, ButtonHTMLAttributes } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface RangeSelectButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display inside the button */
  icon: ReactNode;

  /** Optional additional CSS classes */
  className?: string;

  /** Accessible label for the button */
  ariaLabel?: string;
}

/**
 * A customizable button component for selecting ranges, displaying an icon.
 */
const RangeSelectButton = forwardRef<HTMLButtonElement, RangeSelectButtonProps>(
  ({ icon, onClick, className, ariaLabel, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          'flex h-auto items-center justify-center rounded-md p-0',
          className,
        )}
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        {...props}
      >
        <div className="mx-1 shrink-0 text-xl">{icon}</div>
      </Button>
    );
  },
);

RangeSelectButton.displayName = 'RangeSelectButton';

export { RangeSelectButton };
