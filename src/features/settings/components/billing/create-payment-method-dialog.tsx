import React, { ReactNode, useState } from 'react';

import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CreatePaymentMethodForm } from '@/features/settings/components/billing/create-payment-method-form';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export function CreatePaymentMethodDialog({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="rounded-t-[10px]">
          <div className="grid gap-4 p-10">
            <h1 className="text-3xl">Add a new card</h1>
            <CreatePaymentMethodForm onSuccess={() => setOpen(false)} />
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
          <h1 className="text-3xl">Add a new card</h1>
          <CreatePaymentMethodForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
