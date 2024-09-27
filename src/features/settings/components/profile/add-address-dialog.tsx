import { ReactNode } from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { AddAddressForm } from './add-address-form';

export function AddAddressDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-12">
        <h1 className="text-3xl">Add an address</h1>
        <AddAddressForm />
      </DialogContent>
    </Dialog>
  );
}
