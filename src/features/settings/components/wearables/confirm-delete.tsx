import React from 'react';

import { Button } from '@/components/ui/button';
import { DialogClose, DialogContent } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useDeleteWearable } from '@/features/settings/api';

export function ConfirmDelete({ provider }: { provider: string }) {
  const { mutateAsync, isPending } = useDeleteWearable();

  const onDelete = async (provider: string): Promise<void> => {
    await mutateAsync({ provider });
  };

  return (
    <DialogContent className="w-full max-w-[432px] space-y-8 p-9 md:p-12">
      <h1 className="text-center text-2xl text-[#18181B]">
        Are you sure you want to disconnect this integration?
      </h1>
      <div className="mx-auto flex w-full items-center justify-center gap-4">
        <DialogClose asChild>
          <Button variant="outline" className="px-8 py-4">
            Cancel
          </Button>
        </DialogClose>
        <Button
          className="text-nowrap px-8 py-4"
          onClick={() => onDelete(provider)}
        >
          {isPending ? <Spinner /> : 'Confirm Delete'}
        </Button>
      </div>
    </DialogContent>
  );
}
