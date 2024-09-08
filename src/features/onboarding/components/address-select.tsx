import { Dot, MoreVertical, Plus } from 'lucide-react';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, Body2, Body3 } from '@/components/ui/typography';
import { useUpdateProfile } from '@/features/users/api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ActiveAddress } from '@/types/api';

const AddressSelect = ({
  setIsAddingAddress,
  selectedAddress,
  onAddressSelect,
}: {
  // setIsEditingAddress: () => void;
  selectedAddress: ActiveAddress | null;
  setIsAddingAddress: () => void;
  onAddressSelect: (address: ActiveAddress) => void;
}) => {
  const userQuery = useUser({});
  const updateProfileMutation = useUpdateProfile();
  const [selected, setSelected] = useState<ActiveAddress | null>(
    selectedAddress,
  );

  if (!userQuery.data) {
    return null;
  }

  const user = userQuery.data;

  return (
    <div className="rounded-xl border border-zinc-200">
      <RadioGroup defaultValue={selectedAddress?.id} className="p-2">
        {user.activeAddresses.map((a, index) => (
          <div
            className={cn(
              'flex w-full items-center gap-4 rounded-lg px-4 py-3',
              selected?.id === a.id ? 'bg-[#F7F7F7]' : null,
            )}
            key={index}
            role="presentation"
          >
            <RadioGroupItem
              value={a.id}
              className="min-h-5 min-w-5 border-zinc-200"
              onClick={() => {
                setSelected(a);
                onAddressSelect(a);
              }}
            />
            <div className="w-full">
              <div className="flex items-center gap-1">
                <Body1 className="text-zinc-600">
                  {`${a.address.line.join(' ')}`}
                </Body1>
                {user.primaryAddress?.id === a.id ? (
                  <div className="hidden items-center gap-1 xl:flex">
                    <Dot className="text-zinc-500" />
                    <Body3 className="text-zinc-500">Default address</Body3>
                  </div>
                ) : null}
              </div>
              <div className="space-y-1">
                <Body3 className="line-clamp-1 text-zinc-400">
                  {`${a.address.city}, ${a.address.state}, ${a.address.postalCode}, United States`}
                </Body3>
                {user.primaryAddress?.id === a.id ? (
                  <Body3 className="text-zinc-500 xl:hidden">
                    Default address
                  </Body3>
                ) : null}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <MoreVertical className="size-4 cursor-pointer text-zinc-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl p-2">
                {/*<DropdownMenuItem*/}
                {/*  className="cursor-pointer rounded-lg p-4 text-base font-normal text-zinc-500"*/}
                {/*  onClick={setIsEditingAddress}*/}
                {/*>*/}
                {/*  Edit*/}
                {/*</DropdownMenuItem>*/}
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg p-4 text-base  font-normal text-zinc-500"
                  onClick={() =>
                    updateProfileMutation.mutate({
                      data: {
                        primaryAddress: a,
                      },
                    })
                  }
                >
                  Set default
                </DropdownMenuItem>
                {/*<DropdownMenuItem className="cursor-pointer rounded-lg p-4  text-base font-normal text-[#B90090] focus:bg-[#FFF6FD] focus:text-[#B90090]">*/}
                {/*  Delete*/}
                {/*</DropdownMenuItem>*/}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </RadioGroup>
      <div className="group flex cursor-pointer items-center gap-1.5 px-6 pb-3">
        <Plus className="size-[14px] text-zinc-400 transition-colors group-hover:text-zinc-500" />
        <Body2
          className="text-zinc-400 transition-colors group-hover:text-zinc-500"
          onClick={setIsAddingAddress}
        >
          Add address
        </Body2>
      </div>
    </div>
  );
};

export { AddressSelect };
