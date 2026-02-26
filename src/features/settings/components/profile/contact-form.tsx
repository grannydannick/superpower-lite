import React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressSelect } from '@/features/users/components/address-select';
import { useUser } from '@/lib/auth';

export function ContactForm() {
  const { data: user } = useUser();

  if (!user) {
    return <div className="md:p-16">No profile information found.</div>;
  }

  const { email, phone } = user;

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
      <AddressSelect />
    </div>
  );
}
