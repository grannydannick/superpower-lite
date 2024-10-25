import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body3, H2, H3 } from '@/components/ui/typography';
import { AddAddressForm } from '@/features/onboarding/components/add-address-form';
import { EditAddressForm } from '@/features/onboarding/components/edit-address-form';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { AddressSelect } from '@/features/users/components/address-select';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
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
  const { nextOnboardingStep, prevStep, updatingStep } = useStepper((s) => s);
  const { data: user } = useUser();
  const { updateServiceAddress } = useOnboarding();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const next = () => {
    if (!user?.primaryAddress) {
      toast.warning('No primary address added.');
      return;
    }

    updateServiceAddress(user?.primaryAddress);
    nextOnboardingStep();
  };

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

          <AddressSelect
            onAddressAdd={() => setIsAddingAddress((prev) => !prev)}
          />
        </div>
        <div className="flex items-center justify-end">
          <div className="space-x-4">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button onClick={next} disabled={updatingStep}>
              {updatingStep ? <Spinner /> : 'Next'}
            </Button>
          </div>
        </div>
      </>
    </section>
  );
};
