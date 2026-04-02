import { m } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ReactNode, useContext } from 'react';

import { cn } from '@/lib/utils';

import { ProtocolStepperContext } from './reveal/protocol-stepper-context';

interface ProtocolListingButtonProps extends Omit<
  HTMLMotionProps<'div'>,
  'children'
> {
  children: ReactNode;
  delay?: number;
  className?: string;
  isAnimated?: boolean;
  compact?: boolean;
}

export const ProtocolListingButton = ({
  children,
  delay = 0,
  className = '',
  isAnimated = true,
  compact = false,
  onClick,
  onKeyDown,
  ...props
}: ProtocolListingButtonProps) => {
  // Use context directly to make it optional (won't throw if not in provider)
  const stepperContext = useContext(ProtocolStepperContext);

  const handleClick = (e?: any) => {
    if (onClick) return (onClick as any)(e);
    // Only call next if we're in the stepper context
    if (stepperContext) {
      stepperContext.next();
    }
  };

  const baseClassName = cn(
    'group/protocol-link cursor-pointer rounded-2xl border border-zinc-200 bg-white px-4 shadow shadow-black/[.03] transition-colors',
    className,
  );

  const content = (
    <div
      className={cn(
        'flex items-center justify-between',
        !compact && 'min-h-24',
      )}
    >
      <div className="flex flex-1 items-center justify-between gap-4 pr-4">
        {children}
      </div>
      <ChevronRight className="size-5 text-zinc-400 transition-all ease-out group-hover/protocol-link:translate-x-0.5 group-hover/protocol-link:text-zinc-600" />
    </div>
  );

  if (isAnimated) {
    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={baseClassName}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (onKeyDown) onKeyDown(e);
          if (e.key === 'Enter' && !onKeyDown) handleClick(e as any);
        }}
        {...props}
      >
        {content}
      </m.div>
    );
  }

  return (
    <div
      className={baseClassName}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (onKeyDown) onKeyDown(e);
        if (e.key === 'Enter' && !onKeyDown) handleClick(e as any);
      }}
    >
      {content}
    </div>
  );
};
