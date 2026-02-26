import React, { ReactNode } from 'react';

import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown';
import { ConfirmDelete } from '@/features/settings/components/wearables/confirm-delete';
import { Wearable } from '@/types/api';

interface MenuDropdownProps {
  children: ReactNode;
  wearable: Wearable;
}

export function MenuDropdown({ children, wearable }: MenuDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] rounded-[16px] border-none"
      >
        <DeleteMenuItem {...wearable} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DeleteMenuItem({ provider }: Wearable) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
          }}
          className="cursor-pointer rounded-[12px] p-4 text-base text-[#B90090] focus:bg-[#FFF6FD] focus:text-[#B90090]"
        >
          Delete
        </DropdownMenuItem>
      </DialogTrigger>
      <ConfirmDelete provider={provider} />
    </Dialog>
  );
}
