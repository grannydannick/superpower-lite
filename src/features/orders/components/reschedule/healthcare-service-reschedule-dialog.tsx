import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import React, { ReactNode, useState, useCallback, useMemo } from 'react';

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
import { StepID } from '@/features/orders/types/step-id';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { HealthcareService, Order } from '@/types/api';

import { HealthcareServiceDialog } from '../healthcare-service-dialog';

import { HealthcareServiceRescheduleConfirmation } from './healthcare-service-reschedule-confirmation';
import { HealthcareServiceRescheduleDetails } from './healthcare-service-reschedule-details';

export const HealthcareServiceRescheduleDialog = ({
  order,
  healthcareService,
  children,
  onOpenChange,
  open,
  onSubmit,
}: {
  order: Order;
  healthcareService: HealthcareService;
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  onSubmit?: () => void;
}) => {
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<RescheduleDialogMode>('default');
  const [skipStepIds, setSkipStepIds] = useState<StepID[]>([]);

  const title = (() => {
    switch (mode) {
      case 'cancel':
        return 'Cancel Appointment';
      case 'reschedule':
        return 'Reschedule Appointment';
      case 'booking':
        return 'Book Appointment';
      default:
        return 'Appointment Details';
    }
  })();

  const content = useMemo(() => {
    switch (mode) {
      case 'default':
        return (
          <HealthcareServiceRescheduleDetails
            order={order}
            healthcareService={healthcareService}
          />
        );
      case 'cancel':
      case 'reschedule':
        return (
          <HealthcareServiceRescheduleConfirmation
            healthcareService={healthcareService}
            order={order}
            mode={mode}
          />
        );
      case 'booking':
        return (
          <HealthcareServiceDialog
            healthcareService={healthcareService}
            excludeSteps={skipStepIds}
            onSubmit={onSubmit}
          />
        );
      default:
        return null;
    }
  }, [mode, order, healthcareService, skipStepIds, onSubmit]);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        resyncDataAfterCancelOrder({ queryClient });
        setMode('default');
        setSkipStepIds([]);
      }
      onOpenChange?.(open);
    },
    [queryClient, onOpenChange],
  );

  const closeAll = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  if (width <= 768) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex flex-col overflow-hidden rounded-t-2xl">
          <SheetHeader className="sticky top-0 z-50 flex flex-col gap-4 bg-white/90 pb-4 backdrop-blur-sm">
            <SheetTitle className="grid w-full grid-cols-3 items-center">
              <SheetClose
                onClick={closeAll}
                className="flex size-10 items-center justify-center rounded-full bg-zinc-100"
              >
                <X className="size-5 text-black" />
              </SheetClose>
              <span className="text-center">{title}</span>
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
            setSkipStepIds={setSkipStepIds}
            onClose={closeAll}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col px-0.5">
        <DialogHeader className="sticky top-0 z-50 bg-white/90 px-10 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-zinc-500">{title}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Dialog for seeing appointment details as well as canceling and
            rescheduling
          </DialogDescription>
          <DialogClose className="size-6 cursor-pointer p-1" onClick={closeAll}>
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
          setSkipStepIds={setSkipStepIds}
          onClose={closeAll}
        />
      </DialogContent>
    </Dialog>
  );
};
