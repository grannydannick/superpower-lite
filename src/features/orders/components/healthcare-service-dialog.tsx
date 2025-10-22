import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { getOrdersQueryOptions } from '@/features/orders/api';
import {
  OrderStoreProvider,
  useOrder,
} from '@/features/orders/stores/order-store';
import {
  BookingStepID,
  getStepsFromService,
} from '@/features/orders/utils/get-steps-for-service';
import { getServicesQueryOptions } from '@/features/services/api';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { StepperStoreProvider, useStepper } from '@/lib/stepper';
import { HealthcareService } from '@/types/api';

export const HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE = 'px-6 md:px-16';

/**
 * This component is the main renderer of the scheduling process for all services.
 * It first retrieves the relevant steps and wraps them into order and stepper contexts for navigation and ordering.
 * Any additional steps should be created and added here using the `get-steps-for-service` function.
 *
 * `children` is expected to be a button that triggers this dialog from anywhere.
 *
 * @param {ReactNode} children - A button to trigger the dialog for scheduling services.
 * @param healthcareService - The healthcare service being scheduled. If not provided, then won't render inside the modal
 * @param excludeSteps - Steps that we want to exclude. It's important to check if step is required and can be skipped.
 * @param flow - Will render full steps flow or just information about service
 * @param infoFlowBtn - Will replace regular footer on the info step
 * @param onSuccess - Called when order is either created or updated
 * @param onClose - Called when "Done" button is clicked or used closed the modal
 * @param initialAddOnIds - Initial add-on IDs to be selected
 */
type HealthcareServiceDialogProps = {
  healthcareService: HealthcareService;
  excludeSteps?: BookingStepID[];
  onSuccess?: () => void;
  onClose?: () => void;
  children?: ReactNode;
  flow?: 'full' | 'info';
  infoFlowBtn?: () => ReactNode;
  initialAddOnIds?: undefined | string[];
};

export const HealthcareServiceDialog: React.FC<
  HealthcareServiceDialogProps
> = ({
  healthcareService,
  excludeSteps,
  onSuccess,
  onClose,
  children,
  flow = 'full',
  infoFlowBtn,
  initialAddOnIds,
}) => {
  let steps = getStepsFromService(healthcareService);

  if (excludeSteps) {
    steps = steps.filter((step) => !excludeSteps.includes(step.id));
  }

  // this is used if you only need to display information about service
  if (flow === 'info') {
    const info = steps.find((s) => s.id === BookingStepID.INFO);

    if (!info) {
      throw Error(
        `Info step was not found for ${healthcareService.name}, can't render flow in info mode`,
      );
    }

    steps = [info];
  }

  // TODO: should probably add serviceId here as well to make it unique
  const key = steps.map((s) => s.id).join('-');

  return (
    <StepperStoreProvider key={key} steps={steps}>
      <OrderStoreProvider
        service={healthcareService}
        onSuccess={onSuccess}
        flow={flow}
        infoFlowBtn={infoFlowBtn}
        preselectedAddOnIds={initialAddOnIds}
      >
        <HealthcareServiceDialogConsumer onClose={onClose}>
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
 * @param {ReactNode} children - A button or element used to trigger the dialog for scheduling services. If not provided, then won't render inside the modal
 * @param onSubmit
 */
const HealthcareServiceDialogConsumer = ({
  children,
  onClose,
}: {
  onClose?: () => void;
  children?: ReactNode;
}) => {
  const { steps, activeStep, resetSteps } = useStepper((s) => s);
  const queryClient = useQueryClient();
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
      onClose?.();

      /**
       * Refreshing timeline
       */
      queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getServicesQueryOptions().queryKey,
      });

      setTimeout(() => {
        reset();
        resetSteps();
      }, 500); // 500 ms = 0.5 seconds delay
    }
  };

  /**
   * If children (that always should be a button) is not passed, we directly call the content of modal
   * This allows us to trigger and invoke any logic we want under handleOpenChange
   *
   * We still wrap into <Dialog /> simply because we have places where we call <DialogClose> that should be wrapped inside of Dialog
   * Moreover, it doesn't impact anything since Dialog is just a provider:
   * https://github.com/radix-ui/primitives/blob/74b182b401c8ca0fa5b66a5a9a47f507bb3d5adc/packages/react/dialog/src/Dialog.tsx#L50
   */
  if (!children) {
    return (
      <Dialog onOpenChange={handleOpenChange}>
        <div className="mx-auto w-full max-w-3xl py-8">
          {steps[activeStep]?.content ?? null}
        </div>
      </Dialog>
    );
  }
  if (width <= 768) {
    return (
      <Sheet onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex flex-col overflow-hidden rounded-t-2xl bg-white">
          <SheetHeader className="sticky top-0 z-50 flex flex-col gap-4 px-6 pb-4 backdrop-blur-sm">
            {steps.length > 1 ? (
              <div className="flex justify-center">
                <Progress
                  value={((activeStep + 1) / steps.length) * 100}
                  className="h-1 w-32"
                />
              </div>
            ) : null}
            <SheetTitle className="grid w-full grid-cols-3 items-center">
              <SheetClose className="flex size-10 items-center justify-center rounded-full bg-zinc-100">
                <X className="size-5 text-black" />
              </SheetClose>
              <span className="text-center">Book a service</span>
              <div className="size-10" />
            </SheetTitle>
          </SheetHeader>
          <SheetDescription className="sr-only">
            Dialog for booking healthcare services and managing the scheduling
            process
          </SheetDescription>
          <div className="flex-1 overflow-auto">
            {steps[activeStep]?.content ?? null}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col bg-white px-0.5">
        <DialogHeader className="sticky top-0 z-50 px-16 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {steps.length > 1 && (
              <>
                <DialogTitle className="text-zinc-500">
                  Step {activeStep + 1} / {steps.length}
                </DialogTitle>
                <Progress
                  value={((activeStep + 1) / steps.length) * 100}
                  className="ml-2 h-1 w-32"
                />
              </>
            )}
          </div>
          <DialogDescription className="sr-only">
            Dialog for booking healthcare services and managing the scheduling
            process
          </DialogDescription>
          <DialogClose>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </DialogHeader>
        {/*
         * Custom scrollbar psuedo-element styling:
         * - [overflow:overlay] - Positions scrollbar on top of content without taking up space
         * - [&::-webkit-scrollbar]:w-2 - Sets the width of the scrollbar track to 2px
         * - [&::-webkit-scrollbar-thumb]:rounded-full - Makes the scrollbar thumb fully rounded
         * - [&::-webkit-scrollbar-button:end:increment] - Targets the bottom pseudo-element of the scrollbar
         *   - block - Makes the pseudo-element visible (but transparent)
         *   - h-[13vh] - Creates an invisible spacer to offset the scrollbar from the sticky footer
         */}
        <div className="flex-1 overflow-y-auto scrollbar scrollbar-thumb-zinc-300 [overflow:overlay] [&::-webkit-scrollbar-button:end:increment]:block [&::-webkit-scrollbar-button:end:increment]:h-[13vh] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:w-2">
          {steps[activeStep]?.content ?? null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
