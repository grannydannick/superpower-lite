import { X } from 'lucide-react';
import moment from 'moment-timezone';
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
import { Body1, Body2 } from '@/components/ui/typography';
import {
  OrderStoreProvider,
  useOrder,
} from '@/features/orders/stores/order-store';
import { getDefaultCollectionMethod } from '@/features/orders/utils/get-default-collection-method';
import { getStepsFromService } from '@/features/orders/utils/get-steps-for-service';
import { useGetSchedulingLink } from '@/features/services/api/get-scheduling-link';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { StepperStoreProvider, useStepper } from '@/lib/stepper';
import { HealthcareService } from '@/types/api';
/**
 * This component is the main renderer of the scheduling process for all services.
 * It first retrieves the relevant steps and wraps them into order and stepper contexts for navigation and ordering.
 * Any additional steps should be created and added here using the `get-steps-for-service` function.
 *
 * `children` is expected to be a button that triggers this dialog from anywhere.
 *
 * @param {ReactNode} children - A button to trigger the dialog for scheduling services.
 * @param {HealthcareService} healthcareService - The healthcare service being scheduled.
 * @param {string} draftOrderId - Draft order id if we want to finish booking order that we already created before
 */
export const HealthcareServiceDialog = ({
  children,
  healthcareService,
  draftOrderId,
}: {
  children: ReactNode;
  healthcareService: HealthcareService;
  draftOrderId?: string;
}) => {
  const schedulingLinkQuery = useGetSchedulingLink();

  const steps = getStepsFromService(
    healthcareService,
    schedulingLinkQuery.data?.link,
    draftOrderId,
  );

  const collectionMethod = getDefaultCollectionMethod(healthcareService);

  return (
    <StepperStoreProvider steps={steps}>
      <OrderStoreProvider
        service={healthcareService}
        tz={moment.tz.guess()}
        collectionMethod={collectionMethod}
        draftOrderId={draftOrderId ? draftOrderId : null}
      >
        <HealthcareServiceDialogConsumer>
          {children}
        </HealthcareServiceDialogConsumer>
      </OrderStoreProvider>
    </StepperStoreProvider>
  );
};

/**
 * This component consumes the healthcare service dialog and renders its content.
 * It wraps the children with the required `Dialog` and `DialogTrigger` components for modal functionality.
 *
 * `children` is expected to be a button that triggers the dialog, wrapped inside <DialogTrigger />.
 *
 * @param {ReactNode} children - A button or element used to trigger the dialog for scheduling services.
 */
const HealthcareServiceDialogConsumer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { steps, activeStep, resetSteps } = useStepper((s) => s);
  const reset = useOrder((s) => s.reset);
  const { width } = useWindowDimensions();

  /**
   * Handles the `onOpenChange` event for the Drawer and Dialog, delaying the resetSteps function
   * by 0.5 seconds when the Drawer is closed.
   *
   * @param {boolean} isOpen - A boolean value that indicates whether the Drawer or Dialog is open or closed.
   */
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        reset();
        resetSteps();
      }, 500); // 500 ms = 0.5 seconds delay
    }
  };

  if (width <= 768) {
    return (
      <Sheet onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="flex max-h-full flex-col rounded-t-[10px]"
        >
          <div className="flex items-center justify-between px-4 pt-16 md:pb-4">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#F7F7F7]">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body2>Book a service</Body2>
            <div className="min-w-[44px]" />
          </div>
          <div className="overflow-auto">
            {steps[activeStep]?.content ?? null}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="max-h-[90vh] overflow-y-scroll rounded-xl">
          <div>
            <div className="flex flex-row items-center justify-between px-14 pb-6 pt-12">
              <Body1 className="text-zinc-500">Book a service</Body1>
              <DialogClose>
                <X className="size-6 cursor-pointer p-1" />
              </DialogClose>
            </div>
            <div>{steps[activeStep]?.content ?? null}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
