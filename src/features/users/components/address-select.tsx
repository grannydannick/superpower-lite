import { useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Plus } from 'lucide-react';
import { ReactNode } from 'react';

import { DotIcon } from '@/components/icons/dot';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Label } from '@/components/ui/label';
import { Body1, Body3 } from '@/components/ui/typography';
import { AddAddressDialog } from '@/features/settings/components/profile/add-address-dialog';
import { useUpdateProfile } from '@/features/users/api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const AddressSelect = ({
  onAddressAdd,
  closeBtn,
}: {
  onAddressAdd?: () => void;
  closeBtn?: ReactNode;
}) => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { mutateAsync } = useUpdateProfile({
    mutationConfig: {
      onSuccess: () => {
        queryClient.resetQueries();
      },
    },
  });

  if (!user) {
    return <div className="md:p-16">Cannot load user information.</div>;
  }

  const { primaryAddress, activeAddresses } = user;

  return (
    <div className="space-y-2">
      {closeBtn ? (
        <div className="flex items-center justify-between">
          <Label className="text-sm text-zinc-500">Active addresses</Label>
          {closeBtn}
        </div>
      ) : (
        <Label className="text-sm text-zinc-500">Active addresses</Label>
      )}
      <div className="rounded-xl border border-zinc-200 bg-white md:bg-transparent">
        {activeAddresses.length > 0 && (
          <div className="p-2">
            {activeAddresses.map((activeAddress, i) => (
              <div
                className={cn(
                  'flex items-center justify-between rounded-[8px] p-4 hover:bg-zinc-50',
                  primaryAddress?.id === activeAddress.id ? 'bg-zinc-50' : null,
                )}
                key={i}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Body1 className="text-zinc-600">
                      {activeAddress.address.line.join(' ')}
                    </Body1>
                    {user.primaryAddress?.id === activeAddress.id ? (
                      <div className="hidden items-center gap-2 md:flex">
                        <DotIcon className="text-zinc-500" />
                        <Body3 className="text-zinc-500">Default address</Body3>
                      </div>
                    ) : null}
                  </div>
                  <Body3 className="text-zinc-400">
                    {activeAddress.address.city}, {activeAddress.address.state},{' '}
                    {activeAddress.address.postalCode}, United States
                  </Body3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {primaryAddress?.id !== activeAddress.id ? (
                      <MoreVertical className="size-4 cursor-pointer text-zinc-400" />
                    ) : null}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-2xl p-2">
                    {/*<DropdownMenuItem*/}
                    {/*  className="cursor-pointer rounded-lg p-4 text-base font-normal text-zinc-500"*/}
                    {/*  onClick={setIsEditingAddress}*/}
                    {/*>*/}
                    {/*  Edit*/}
                    {/*</DropdownMenuItem>*/}
                    <DropdownMenuItem
                      onClick={async () =>
                        await mutateAsync({
                          data: {
                            primaryAddress: activeAddress,
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
          </div>
        )}
        <div
          className={cn(activeAddresses.length > 0 ? 'pb-3' : 'py-3', `px-6`)}
        >
          {onAddressAdd ? (
            <Button
              variant="ghost"
              className="group flex cursor-pointer items-center gap-1.5 p-0 text-sm text-zinc-400 hover:text-zinc-700"
              onClick={onAddressAdd}
            >
              <Plus
                strokeWidth={2.75}
                className="size-4 text-zinc-400 transition-colors group-hover:text-zinc-700"
              />
              Add address
            </Button>
          ) : (
            <AddAddressDialog>
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
            </AddAddressDialog>
          )}
        </div>
      </div>
    </div>
  );
};
