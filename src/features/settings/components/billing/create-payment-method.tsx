import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PaymentMethodForm } from '@/features/settings/components/billing/payment-method-form';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export function CreatePaymentMethod(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="w-full md:w-auto">Add payment method</Button>
        </SheetTrigger>
        <SheetContent className="rounded-t-[10px]">
          <div className="grid gap-4 p-10">
            <h1 className="text-3xl">Add a new card</h1>
            <PaymentMethodForm setClosed={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">Add payment method</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="grid gap-4 p-10">
          <h1 className="text-3xl">Add a new card</h1>
          <PaymentMethodForm setClosed={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
