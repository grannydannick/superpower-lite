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
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { StepperStoreProvider, useStepper } from '@/components/ui/stepper';
import { Body1 } from '@/components/ui/typography';
import {
  OrderStoreProvider,
  useOrder,
} from '@/features/orders/stores/order-store';
import { getDefaultCollectionMethod } from '@/features/orders/utils/get-default-collection-method';
import { getStepsFromService } from '@/features/orders/utils/get-steps-for-service';
import { useGetSchedulingLink } from '@/features/services/api/get-scheduling-link';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
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
 */
export const HealthcareServiceDialog = ({
  children,
  healthcareService,
}: {
  children: ReactNode;
  healthcareService: HealthcareService;
}) => {
  const schedulingLinkQuery = useGetSchedulingLink();

  const steps = getStepsFromService(
    healthcareService,
    schedulingLinkQuery.data?.link,
  );

  const collectionMethod = getDefaultCollectionMethod(healthcareService);

  return (
    <StepperStoreProvider steps={steps}>
      <OrderStoreProvider
        service={healthcareService}
        tz={moment.tz.guess()}
        collectionMethod={collectionMethod}
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
      <Drawer onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="h-screen">
          <div className="flex items-center justify-center px-6 pb-3 pt-10">
            {/*<Button*/}
            {/*  variant="glass"*/}
            {/*  className="size-12 rounded-full p-0"*/}
            {/*>*/}
            {/*  <ChevronLeft className="size-4" />*/}
            {/*</Button>*/}
            <Body1>Service</Body1>
          </div>
          <div className="overflow-y-auto px-6 pb-6">
            {steps[activeStep]?.content ?? null}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="max-h-[90vh] overflow-y-scroll rounded-xl">
          <div>
            <div className="flex flex-row items-center justify-between px-12 pb-6 pt-12">
              <Body1 className="text-zinc-500">Service</Body1>
              <DialogClose>
                <X className="size-6 cursor-pointer p-1" />
              </DialogClose>
            </div>
            <div className="p-12">{steps[activeStep]?.content ?? null}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
