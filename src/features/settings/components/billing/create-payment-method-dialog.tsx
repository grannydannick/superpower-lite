import React, { ReactNode, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CreatePaymentMethodForm } from '@/features/settings/components/billing/create-payment-method-form';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export function CreatePaymentMethodDialog({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="rounded-t-[10px]">
          <div className="grid gap-4 p-10">
            <SheetTitle className="text-3xl">Add a new card</SheetTitle>
            <SheetDescription className="sr-only">
              Add a new payment method to your account.
            </SheetDescription>
            <CreatePaymentMethodForm
              onSuccess={() => setOpen(false)}
              onClose={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="grid gap-4 p-10">
          <DialogTitle className="text-3xl">Add a new card</DialogTitle>
          <DialogDescription className="sr-only">
            Add a new payment method to your account.
          </DialogDescription>
          <CreatePaymentMethodForm
            onSuccess={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
