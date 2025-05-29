import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import React, { ReactNode, useState } from 'react';

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
import { resyncDataAfterCancelOrder } from '@/features/orders/api/cancel-order';
import { HealthcareServiceRescheduleFooter } from '@/features/orders/components/reschedule/healthcare-service-reschedule-footer';
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

  const handleClose = () => {
    resyncDataAfterCancelOrder({ queryClient });
    setMode('default');
  };

  const content = (
    <>
      {mode === 'default' ? (
        <HealthcareServiceRescheduleDetails
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
    </>
  );

  if (width <= 768) {
    return (
      <Sheet onOpenChange={handleClose}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex flex-col overflow-hidden rounded-t-2xl">
          <SheetHeader className="sticky top-0 z-50 flex flex-col gap-4 bg-white/90 pb-4 backdrop-blur-sm">
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
          <div className="flex-1 overflow-auto">{content}</div>
          <HealthcareServiceRescheduleFooter
            healthcareService={healthcareService}
            order={order}
            mode={mode}
            setMode={setMode}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col px-0.5">
        <DialogHeader className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-zinc-500">{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Dialog for seeing appointment details as well as canceling and
            rescheduling
          </DialogDescription>
          <DialogClose
            className="size-6 cursor-pointer p-1"
            onClick={() => setMode('default')}
          >
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
          {content}
        </div>
        <HealthcareServiceRescheduleFooter
          healthcareService={healthcareService}
          order={order}
          mode={mode}
          setMode={setMode}
        />
      </DialogContent>
    </Dialog>
  );
};
