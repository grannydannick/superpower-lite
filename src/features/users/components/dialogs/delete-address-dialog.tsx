import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from '@/components/ui/dialog/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown';
import { H2 } from '@/components/ui/typography';
import { useDeleteAddress } from '@/features/users/api/delete-address';
import { Address } from '@/types/api';

interface DeleteAddressDialogProps {
  address: Address;
}

export function DeleteAddressDialog({ address }: DeleteAddressDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteAddressMutation = useDeleteAddress();

  const handleDeleteAddress = async () => {
    await deleteAddressMutation.mutateAsync({ addressId: address.id });

    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="cursor-pointer text-[#B90090] focus:bg-[#FFF6FD] focus:text-[#B90090]"
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[95vw] p-8 sm:max-w-[525px]">
        <AlertDialogHeader className="mb-4">
          <H2>Delete address</H2>
          <AlertDialogDescription className="text-base text-zinc-600">
            Are you sure you want to delete this address? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel className="rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAddress}
            className="rounded-xl bg-[#B90090] text-white hover:bg-[#97007A]"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
