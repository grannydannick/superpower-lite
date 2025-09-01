import { Plus } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { useAddressManagement } from '../hooks/use-address-management';

import { AddressCard } from './address-card';
import { AddressDialog } from './dialogs/address-dialog';

/**
 *
 * @param closeBtn - optional close button
 * @param dropdownMenuMode - radix-ui specific parameter, if set to 'modal' then will work inside of modal properly, otherwise should be set to default
 * @constructor
 */
export const AddressSelect = ({ closeBtn }: { closeBtn?: ReactNode }) => {
  const { setDefaultAddress, addresses, primaryAddressId } =
    useAddressManagement();

  if (!addresses.length) {
    return (
      <div className="space-y-2">
        <Label className="text-sm text-zinc-500">Active addresses</Label>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 md:bg-transparent">
          <p className="mb-4 text-center text-zinc-500">No addresses found.</p>
          <AddNewAddressButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AddressHeader closeBtn={closeBtn} />

      <div className="rounded-[20px] border border-zinc-200 bg-white md:bg-transparent">
        <div className="space-y-2 p-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isPrimary={address.id === primaryAddressId}
              onSetDefault={setDefaultAddress}
            />
          ))}
        </div>

        <div className={cn(addresses.length > 0 ? 'pb-3' : 'py-3', 'px-6')}>
          <AddNewAddressButton />
        </div>
      </div>
    </div>
  );
};

const AddressHeader = ({ closeBtn }: { closeBtn?: ReactNode }) => (
  <>
    {closeBtn ? (
      <div className="flex items-center justify-between">
        <Label className="text-sm text-zinc-500">Active addresses</Label>
        {closeBtn}
      </div>
    ) : (
      <Label className="text-sm text-zinc-500">Active addresses</Label>
    )}
  </>
);

const AddNewAddressButton = () => (
  <AddressDialog mode="add">
    <Button
      variant="ghost"
      className="group flex cursor-pointer items-center gap-1.5 p-0 text-sm text-zinc-400 hover:text-zinc-700"
    >
      <Plus
        strokeWidth={2.75}
        className="size-4 text-zinc-400 transition-colors group-hover:text-zinc-700"
      />
      Add address
    </Button>
  </AddressDialog>
);
