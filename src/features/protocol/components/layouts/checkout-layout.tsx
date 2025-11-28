import { PropsWithChildren } from 'react';

import { CheckoutNavbar } from '@/features/protocol/components/checkout/checkout-navbar';
import { cn } from '@/lib/utils';

import { REVEAL_STEPS } from '../reveal/reveal-stepper';

export const CheckoutLayout = ({
  step,
  className,
  children,
}: PropsWithChildren<{ step: string; className?: string }>) => {
  return (
    <div className="space-y-8 pt-8 lg:pt-24">
      {step !== REVEAL_STEPS.AUTOPILOT && <CheckoutNavbar step={step} />}
      <div
        className={cn(
          'mx-auto w-full max-w-[1600px] items-start grid-cols-2 gap-8 px-6 lg:grid lg:gap-16',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};
