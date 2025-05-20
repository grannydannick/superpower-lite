import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { memo } from 'react';

import { DotIcon } from '@/components/icons/dot';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Address } from '@/types/api';

import { AddressDialog } from './dialogs/address-dialog';
import { DeleteAddressDialog } from './dialogs/delete-address-dialog';

interface AddressCardProps {
  address: Address;
  isPrimary: boolean;
}

export const AddressCard = memo(({ address, isPrimary }: AddressCardProps) => {
  return (
    <Label
      className={cn(
        'flex cursor-pointer items-center justify-between rounded-[8px] p-4 hover:bg-zinc-50',
        isPrimary ? 'bg-zinc-50 shadow-sm' : null,
      )}
      htmlFor={`address-${address.id}`}
    >
      <div className="flex items-center gap-4">
        <RadioGroupItem
          value={address.id}
          id={`address-${address.id}`}
          checked={isPrimary}
        />
        <div>
          <div className="flex items-center gap-2">
            <Body1 className="text-zinc-600">{address.line.join(' ')}</Body1>
            {isPrimary && (
              <motion.div
                className="hidden items-center gap-2 md:flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <DotIcon className="text-zinc-500" />
                </motion.span>
                <Body3 className="text-zinc-500">Default address</Body3>
              </motion.div>
            )}
          </div>
          <Body3 className="text-zinc-400">
            {address.city}, {address.state}, {address.postalCode}, United States
          </Body3>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full hover:bg-zinc-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="size-5 text-zinc-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-2xl">
          <AddressEditOption address={address} />
          {!isPrimary ? <DeleteAddressDialog address={address} /> : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </Label>
  );
});

AddressCard.displayName = 'AddressCard';

const AddressEditOption = memo(({ address }: { address: Address }) => (
  <AddressDialog mode="edit" address={address}>
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
      }}
    >
      Edit
    </DropdownMenuItem>
  </AddressDialog>
));

AddressEditOption.displayName = 'AddressEditOption';
