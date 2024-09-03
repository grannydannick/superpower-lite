import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { AddAddressForm } from './add-address-form';

export function AddAddressDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="peer flex cursor-pointer items-center gap-1.5 p-0 text-sm text-[#71717A] hover:bg-white"
        >
          <Plus
            strokeWidth={2.75}
            className="size-4 peer-hover:fill-amber-300"
            color="#A1A1AA"
          />
          Add address
        </Button>
      </DialogTrigger>
      <DialogContent className="p-12">
        <h1 className="text-3xl">Add an address</h1>
        <AddAddressForm />
      </DialogContent>
    </Dialog>
  );
}
