import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import moment from 'moment-timezone';
import { ReactNode } from 'react';

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
import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { getOrdersQueryOptions } from '@/features/orders/api';
import {
  OrderStoreProvider,
  useOrder,
} from '@/features/orders/stores/order-store';
import { getDefaultCollectionMethod } from '@/features/orders/utils/get-default-collection-method';
import {
  getStepsFromService,
  StepID,
} from '@/features/orders/utils/get-steps-for-service';
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
 * @param healthcareService - The healthcare service being scheduled. If not provided, then won't render inside the modal
 * @param draftOrder - Draft order if we want to finish booking order that we already created before
 * @param excludeSteps - Steps that we want to exclude. It's important to check if step is required and can be skipped.
 * @param onSubmit - Called when user clicks "Close" button on success screen
 */
export const HealthcareServiceDialog = ({
  healthcareService,
  excludeSteps,
  onSubmit,
  children,
}: {
  healthcareService: HealthcareService;
  excludeSteps?: StepID[];
  onSubmit?: () => void;
  children?: ReactNode;
}) => {
  const schedulingLinkQuery = useGetSchedulingLink();

  let steps = getStepsFromService(
    healthcareService,
    schedulingLinkQuery.data?.link,
  );

  if (excludeSteps) {
    steps = steps.filter((step) => !excludeSteps.includes(step.id));
  }

  const collectionMethod = getDefaultCollectionMethod(healthcareService);

  return (
    <StepperStoreProvider steps={steps}>
      <OrderStoreProvider
        service={healthcareService}
        tz={moment.tz.guess()}
        collectionMethod={collectionMethod}
        onSubmit={onSubmit ? onSubmit : null}
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
 * @param {ReactNode} children - A button or element used to trigger the dialog for scheduling services. If not provided, then won't render inside the modal
 */
const HealthcareServiceDialogConsumer = ({
  children,
}: {
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
      /**
       * Refreshing list of orders after we are done (doesn't matter if regular close)
       */
      queryClient.invalidateQueries({
        queryKey: getOrdersQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });

      setTimeout(() => {
        reset();
        resetSteps();
      }, 500); // 500 ms = 0.5 seconds delay
    }
  };

  /**
   * If children (that always should be a button) is not passed, we directly call the content of modal
   *
   * We still wrap into <Dialog /> simply because we have places where we call <DialogClose> that should be wrapped inside of Dialog
   * Moreover, it doesn't impact anything since Dialog is just a provider:
   * https://github.com/radix-ui/primitives/blob/74b182b401c8ca0fa5b66a5a9a47f507bb3d5adc/packages/react/dialog/src/Dialog.tsx#L50
   */
  if (!children) {
    return <Dialog>{steps[activeStep]?.content ?? null}</Dialog>;
  }

  if (width <= 768) {
    return (
      <Sheet onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <div className="flex items-center justify-between px-4 pt-16 md:pb-4">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-100">
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
