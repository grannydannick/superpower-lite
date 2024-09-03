import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { PaymentMethodForm } from '@/features/settings/components/billing/payment-method-form';

export function CreatePaymentMethod(): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);

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
