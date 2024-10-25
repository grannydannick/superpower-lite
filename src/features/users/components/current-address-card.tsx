import { Pencil, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, Body2 } from '@/components/ui/typography';
import { AddressSelect } from '@/features/users/components/address-select';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const CurrentAddressCard = ({ className }: { className?: string }) => {
  const { data: user } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const address = user?.primaryAddress?.address;

  if (!user?.primaryAddress) {
    return (
      <div className="w-full space-y-3 rounded-2xl border border-zinc-200 px-8 py-6">
        <Body2 className="text-zinc-500">
          No primary address found, add one in settings.
        </Body2>
      </div>
    );
  }

  if (isEditing) {
    return (
      <AddressSelect
        closeBtn={
          <X
            className="size-4 cursor-pointer text-zinc-500"
            onClick={() => setIsEditing(false)}
          />
        }
      />
    );
  }

  return (
    <div
      className={cn(
        'w-full space-y-3 rounded-2xl border border-zinc-200 px-8 py-6',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Body2 className="text-zinc-400">Current Address</Body2>
        <Button variant="ghost" size="icon">
          <Pencil
            className="size-4 cursor-pointer text-zinc-500"
            onClick={() => setIsEditing(true)}
          />
        </Button>
      </div>

      <div>
        <Body1 className="text-zinc-700">
          {user?.firstName} {user?.lastName}
        </Body1>
        <Body1 className="text-zinc-700">{address?.line.join(' ')}</Body1>
        <Body1 className="text-zinc-700">{address?.city}</Body1>
        <Body1 className="text-zinc-700">
          {address?.state} {address?.postalCode}, US
        </Body1>
      </div>
    </div>
  );
};
