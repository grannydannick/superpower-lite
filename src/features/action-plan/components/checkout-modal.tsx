import { X } from 'lucide-react';
import { ReactNode } from 'react';
import * as React from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body1, H1 } from '@/components/ui/typography';
import { CheckoutStep } from '@/features/action-plan/components/steps/checkout-step';
import { ReviewStep } from '@/features/action-plan/components/steps/review-step';
import {
  CheckoutStoreProvider,
  useCheckout,
} from '@/features/action-plan/stores/checkout-store';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { StepItem, StepperStoreProvider, useStepper } from '@/lib/stepper';
import { PlanGoal } from '@/types/api';

export function ActionPlanCheckoutModal({
  goals,
  children,
}: {
  goals: PlanGoal[];
  children: ReactNode;
}) {
  const steps: StepItem[] = [
    {
      id: 'review',
      content: <ReviewStep />,
    },
    {
      id: 'checkout',
      content: <CheckoutStep />,
    },
  ];

  return (
    <StepperStoreProvider steps={steps}>
      <CheckoutStoreProvider goals={goals}>
        <ActionPlanCheckoutModalConsumer>
          {children}
        </ActionPlanCheckoutModalConsumer>
      </CheckoutStoreProvider>
    </StepperStoreProvider>
  );
}

function ActionPlanCheckoutModalConsumer({
  children,
}: {
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const reset = useCheckout((s) => s.reset);

  if (width <= 768) {
    return (
      <Sheet onOpenChange={reset}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <div className="flex items-center justify-between px-4 pt-16 md:pb-4">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#F7F7F7]">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body1>Action plan</Body1>
            <div className="min-w-[44px]" />
          </div>
          <div className="overflow-auto">
            <ActionPlanCheckoutContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog onOpenChange={reset}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2 px-7 pb-4 pt-7 md:px-14 md:pb-8 md:pt-14">
          <div className="flex w-full items-center justify-between">
            <Body1 className="text-zinc-500">Action plan</Body1>
            <DialogClose>
              <X className="size-6 cursor-pointer p-1" />
            </DialogClose>
          </div>
          <H1>Checkout</H1>
        </div>
        <ActionPlanCheckoutContent />
      </DialogContent>
    </Dialog>
  );
}

function ActionPlanCheckoutContent() {
  const { steps, activeStep } = useStepper((s) => ({
    steps: s.steps,
    activeStep: s.activeStep,
  }));

  return <div className="w-full">{steps[activeStep].content}</div>;
}
