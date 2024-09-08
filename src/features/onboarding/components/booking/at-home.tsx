import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Body1, Body2, Body3, H2, H3 } from '@/components/ui/typography';
import { AddAddressForm } from '@/features/onboarding/components/add-address-form';
import { AddressSelect } from '@/features/onboarding/components/address-select';
import { CurrentAddressCard } from '@/features/onboarding/components/current-address-card';
import { EditAddressForm } from '@/features/onboarding/components/edit-address-form';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useStepper } from '@/lib/stepper';

const AtHomeServiceCard = () => {
  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 p-6">
      <H3 className="text-zinc-700">At-home visit</H3>
      <div className="space-y-2">
        <Body1 className="text-zinc-500">
          Stress-free at your home or office. A nurse will come to you.
        </Body1>
        <Body3 className="text-zinc-500">
          Late cancellation or rescheduling fees apply.
        </Body3>
      </div>
    </div>
  );
};

export const AtHome = () => {
  const { nextOnboardingStep, prevStep } = useStepper((s) => s);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const { updateServiceAddress, serviceAddress } = useOnboarding();

  if (isEditingAddress) {
    return (
      <div className="space-y-8">
        <H2 className="text-zinc-900">Edit your address</H2>
        <CurrentAddressCard />
        <EditAddressForm
          setIsEditing={() => setIsEditingAddress((prev) => !prev)}
        />
      </div>
    );
  }

  if (isAddingAddress) {
    return (
      <div className="space-y-8">
        <H2 className="text-zinc-900">Add your address</H2>
        <AddAddressForm
          setIsAdding={() => setIsAddingAddress((prev) => !prev)}
        />
      </div>
    );
  }

  return (
    <section id="main" className="space-y-16">
      <>
        <div className="space-y-4">
          <H2 className="text-zinc-900">Service type</H2>
          <AtHomeServiceCard />
        </div>
        <div className="space-y-4">
          <H2 className="text-zinc-900">Place of service</H2>
          <div className="space-y-2">
            <Body2 className="text-zinc-500">My address</Body2>
            <AddressSelect
              selectedAddress={serviceAddress}
              onAddressSelect={updateServiceAddress}
              setIsAddingAddress={() => setIsAddingAddress((prev) => !prev)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="space-x-4">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={nextOnboardingStep}>Next</Button>
          </div>
        </div>
      </>
    </section>
  );
};
