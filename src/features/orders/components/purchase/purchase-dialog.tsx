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
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { HealthcareService } from '@/types/api';

import {
  PurchaseStoreProvider,
  usePurchaseStore,
} from '../../stores/purchase-store';

import {
  PurchaseDialogStepper,
  usePurchaseDialogStepper,
} from './purchase-dialog-stepper';
import { PurchaseDialogSteps } from './purchase-dialog-steps';

type PurchaseDialogProps = {
  healthcareService: HealthcareService;
  children?: ReactNode;
  onClose?: () => void;
};

export const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  healthcareService,
  children,
  onClose,
}) => {
  return (
    <PurchaseStoreProvider service={healthcareService}>
      <PurchaseDialogConsumer onClose={onClose}>
        {children}
      </PurchaseDialogConsumer>
    </PurchaseStoreProvider>
  );
};

const PurchaseDialogConsumer = ({
  children,
  onClose,
}: {
  children?: ReactNode;
  onClose?: () => void;
}) => {
  const reset = usePurchaseStore((s) => s.reset);
  const { width } = useWindowDimensions();

  const handleClose = () => {
    reset();

    onClose?.();
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
      <Dialog onOpenChange={handleClose}>
        <PurchaseDialogStepper.Scoped>
          <div className="mx-auto w-full max-w-3xl py-8">
            <PurchaseDialogSteps />
          </div>
        </PurchaseDialogStepper.Scoped>
      </Dialog>
    );
  }

  if (width <= 768) {
    return (
      <Sheet onOpenChange={handleClose}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex flex-col overflow-hidden rounded-t-2xl bg-white">
          <PurchaseDialogStepper.Scoped>
            <PurchaseDialogSheetContent />
          </PurchaseDialogStepper.Scoped>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col bg-white px-0.5">
        <PurchaseDialogStepper.Scoped>
          <PurchaseDialogDialogContent />
        </PurchaseDialogStepper.Scoped>
      </DialogContent>
    </Dialog>
  );
};

const PurchaseDialogSheetContent = () => {
  const { currentIndex, validSteps } = usePurchaseDialogStepper();

  const totalSteps = validSteps.length;
  const safeCurrentIndex = currentIndex < 0 ? 0 : currentIndex;
  const stepNumber = totalSteps > 0 ? safeCurrentIndex + 1 : 0;

  return (
    <>
      <SheetHeader className="sticky top-0 z-50 flex flex-col gap-4 px-6 pb-4 pt-8 backdrop-blur-sm">
        <div className="flex justify-center">
          <Progress
            value={totalSteps > 0 ? (stepNumber / totalSteps) * 100 : 0}
            className="h-1 w-32"
          />
        </div>

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
        <PurchaseDialogSteps />
      </div>
    </>
  );
};

const PurchaseDialogDialogContent = () => {
  const { currentIndex, validSteps } = usePurchaseDialogStepper();

  const totalSteps = validSteps.length;
  const safeCurrentIndex = currentIndex < 0 ? 0 : currentIndex;
  const stepNumber = totalSteps > 0 ? safeCurrentIndex + 1 : 0;

  return (
    <>
      <DialogHeader className="sticky top-0 z-50 px-16 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <DialogTitle className="text-zinc-500">
            Step {stepNumber} / {totalSteps}
          </DialogTitle>
          <Progress
            value={totalSteps > 0 ? (stepNumber / totalSteps) * 100 : 0}
            className="ml-2 h-1 w-32"
          />
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
        <PurchaseDialogSteps />
      </div>
    </>
  );
};
