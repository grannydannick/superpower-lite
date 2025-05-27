import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import React, { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  resyncDataAfterCancelOrder,
  useCancelOrder,
} from '@/features/orders/api/cancel-order';
import { RescheduleDialogMode } from '@/features/orders/types/reschedule-dialog-mode';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { HealthcareService, Order } from '@/types/api';

import { HealthcareServiceDialog } from '../healthcare-service-dialog';

import { HealthcareServiceRescheduleConfirmation } from './healthcare-service-reschedule-confirmation';
import { HealthcareServiceRescheduleDetails } from './healthcare-service-reschedule-details';

export const HealthcareServiceRescheduleDialog = ({
  order,
  healthcareService,
  children,
}: {
  order: Order;
  healthcareService: HealthcareService;
  children: ReactNode;
}) => {
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<RescheduleDialogMode>('default');
  const cancelOrderMutation = useCancelOrder({
    shouldResyncImmediately: false,
  });
  const isPastAppointment = new Date(order.startTimestamp) < new Date();

  const getTitle = () => {
    switch (mode) {
      case 'cancel':
        return 'Cancel Appointment';
      case 'reschedule':
        return 'Reschedule Appointment';
      default:
        return 'Appointment Details';
    }
  };

  const handleConfirm = async (mode: RescheduleDialogMode) => {
    await cancelOrderMutation.mutateAsync({ orderId: order.id });
    if (mode === 'reschedule') {
      setMode('booking');
    } else {
      resyncDataAfterCancelOrder({ queryClient });
    }
  };

  const handleClose = () => {
    resyncDataAfterCancelOrder({ queryClient });
    setMode('default');
  };

  if (width <= 768) {
    return (
      <Sheet onOpenChange={handleClose}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-[83.3333vh] flex-col overflow-hidden rounded-t-2xl">
          <SheetHeader className="sticky top-0 z-50 -mt-8 flex flex-col gap-4 bg-white/90 pb-4 backdrop-blur-sm">
            <SheetTitle className="grid w-full grid-cols-3 items-center">
              <SheetClose
                onClick={() => setMode('default')}
                className="flex size-10 items-center justify-center rounded-full bg-zinc-100"
              >
                <X className="size-5 text-black" />
              </SheetClose>
              <span className="text-center">{getTitle()}</span>
              <div className="size-10" />
            </SheetTitle>
          </SheetHeader>
          <SheetDescription className="sr-only">
            Dialog for booking healthcare services and managing the scheduling
            process
          </SheetDescription>
          <div className="flex-1 overflow-auto py-12">
            {mode === 'default' ? (
              <HealthcareServiceRescheduleDetails
                resultsPending={isPastAppointment}
                order={order}
                healthcareService={healthcareService}
              />
            ) : null}
            {mode === 'cancel' ? (
              <HealthcareServiceRescheduleConfirmation
                healthcareService={healthcareService}
                mode={mode}
              />
            ) : null}
            {mode === 'booking' ? (
              <HealthcareServiceDialog healthcareService={healthcareService} />
            ) : null}
            {mode === 'reschedule' ? (
              <HealthcareServiceRescheduleConfirmation
                healthcareService={healthcareService}
                mode={mode}
              />
            ) : null}
          </div>
          <div className="bottom-0 z-50 flex w-full flex-col items-center justify-end gap-4 bg-white/90 p-5 backdrop-blur-sm md:w-auto md:flex-row [.overflow-auto_&]:sticky [.overflow-y-scroll_&]:sticky">
            {mode === 'default' && !isPastAppointment ? (
              <>
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => setMode('cancel')}
                >
                  Cancel appointment
                </Button>
                <Button
                  className="w-full md:w-auto"
                  onClick={() => setMode('reschedule')}
                >
                  Reschedule
                </Button>
              </>
            ) : null}

            {mode === 'cancel' ? (
              <>
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => setMode('default')}
                >
                  Go back
                </Button>
                <Button
                  className="w-full md:w-auto"
                  onClick={() => handleConfirm(mode)}
                >
                  Confirm cancellation
                </Button>
              </>
            ) : null}

            {mode === 'reschedule' ? (
              <>
                <Button
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => setMode('default')}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full md:w-auto"
                  onClick={() => handleConfirm(mode)}
                >
                  Confirm reschedule
                </Button>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col px-0.5">
        <DialogHeader className="bg-white/90 px-10 pb-4 pt-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-zinc-500">{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Dialog for seeing appointment details as well as canceling and
            rescheduling
          </DialogDescription>
          <DialogClose onClick={() => setMode('default')}>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto scrollbar scrollbar-thumb-zinc-300 [overflow:overlay] [&::-webkit-scrollbar-button:end:increment]:block [&::-webkit-scrollbar-button:end:increment]:h-[13vh] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:w-2">
          {mode === 'default' ? (
            <HealthcareServiceRescheduleDetails
              resultsPending={isPastAppointment}
              order={order}
              healthcareService={healthcareService}
            />
          ) : null}
          {mode === 'cancel' ? (
            <HealthcareServiceRescheduleConfirmation
              healthcareService={healthcareService}
              mode={mode}
            />
          ) : null}
          {mode === 'booking' ? (
            <HealthcareServiceDialog healthcareService={healthcareService} />
          ) : null}
          {mode === 'reschedule' ? (
            <HealthcareServiceRescheduleConfirmation
              healthcareService={healthcareService}
              mode={mode}
            />
          ) : null}
        </div>
        <div className="bottom-0 z-50 flex items-center justify-end gap-4 bg-white/90 p-5 backdrop-blur-sm [.overflow-auto_&]:sticky [.overflow-y-scroll_&]:sticky">
          {mode === 'default' && !isPastAppointment ? (
            <>
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setMode('cancel')}
              >
                Cancel appointment
              </Button>
              <Button
                className="w-full md:w-auto"
                onClick={() => setMode('reschedule')}
              >
                Reschedule
              </Button>
            </>
          ) : null}

          {mode === 'cancel' ? (
            <>
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setMode('default')}
              >
                Go back
              </Button>
              <Button
                className="w-full md:w-auto"
                onClick={() => handleConfirm(mode)}
              >
                Confirm cancellation
              </Button>
            </>
          ) : null}

          {mode === 'reschedule' ? (
            <>
              <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => setMode('default')}
              >
                Cancel
              </Button>
              <Button
                className="w-full md:w-auto"
                onClick={() => handleConfirm(mode)}
              >
                Confirm reschedule
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
