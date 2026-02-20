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
import { Body1, Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Address } from '@/types/api';

import { AddressDialog } from './dialogs/address-dialog';
import { DeleteAddressDialog } from './dialogs/delete-address-dialog';

interface AddressCardProps {
  address: Address;
  isPrimary: boolean;
  onSetDefault?: (address: Address) => void;
}

export const AddressCard = memo(
  ({ address, isPrimary, onSetDefault }: AddressCardProps) => {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-xl border border-transparent p-4 transition-all',
          isPrimary && 'border-zinc-200 bg-zinc-50 shadow-sm',
        )}
      >
        <div className="flex items-center gap-4">
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
              {address.city}, {address.state}, {address.postalCode}, United
              States
            </Body3>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="group size-10 rounded-full hover:bg-zinc-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-5 text-zinc-400 transition-all group-hover:text-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <AddressEditOption address={address} />
            {!isPrimary && onSetDefault ? (
              <DropdownMenuItem
                onClick={() => onSetDefault(address)}
                className="cursor-pointer"
              >
                Set as default
              </DropdownMenuItem>
            ) : null}
            {!isPrimary ? <DeleteAddressDialog address={address} /> : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);

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
