import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, Body3 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useUpdateProfile } from '@/shared/api';
import { ActiveAddress } from '@/types/api';

import { AddAddressDialog } from './add-address-dialog';

export function ContactForm(): JSX.Element {
  const [selectedAddress, setSelectedAddress] = useState<
    ActiveAddress | undefined
  >(undefined);
  const { mutateAsync } = useUpdateProfile();
  const { data: user } = useUser();

  useEffect(() => {
    if (selectedAddress && selectedAddress?.id !== user?.primaryAddress?.id) {
      updateAddress();
    }
  }, [selectedAddress]);

  if (!user) {
    return <div className="md:p-16">No profile information found.</div>;
  }

  const { email, phone, primaryAddress, activeAddresses } = user;

  const updateAddress = async (): Promise<void> => {
    await mutateAsync({ data: { primaryAddress: selectedAddress } });
  };

  return (
    <div className="flex flex-col gap-y-8" id="contact">
      <div className="flex w-full flex-col items-center gap-8 md:flex-row md:gap-4">
        <div className="w-full space-y-2">
          <Label className="text-sm text-[#71717A]">Email</Label>
          <Input
            className="bg-white md:bg-[#EFEFEF4D]"
            value={email}
            disabled
          />
        </div>
        <div className="w-full space-y-2">
          <Label className="text-sm text-[#71717A]">Phone</Label>
          <Input
            className="bg-white md:bg-[#EFEFEF4D]"
            value={phone}
            disabled
          />
        </div>
      </div>
      <div className="mb-8 space-y-2 md:mb-0">
        <Label className="text-sm text-[#71717A]">Active address</Label>
        <div className="rounded-xl border border-zinc-200 bg-white md:bg-transparent">
          {activeAddresses.length > 0 && (
            <RadioGroup
              defaultValue={primaryAddress?.id}
              className="grid-cols-1 gap-0 p-2"
            >
              {activeAddresses.map((activeAddress, i) => (
                <div
                  className="flex items-center space-x-4 rounded-[8px] p-4 hover:bg-[#F7F7F7]"
                  key={i}
                >
                  <RadioGroupItem
                    value={activeAddress.id}
                    onClick={() => setSelectedAddress(activeAddress)}
                    id="r1"
                  />
                  <div>
                    <Body1 className="text-zinc-600">
                      {activeAddress.address.line.join(' ')}
                    </Body1>
                    <Body3 className="text-zinc-400">
                      {activeAddress.address.city},{' '}
                      {activeAddress.address.state},{' '}
                      {activeAddress.address.postalCode}, United States
                    </Body3>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
          <div
            className={cn(activeAddresses.length > 0 ? 'pb-3' : 'py-3', `px-6`)}
          >
            <AddAddressDialog />
          </div>
        </div>
      </div>
    </div>
  );
}
