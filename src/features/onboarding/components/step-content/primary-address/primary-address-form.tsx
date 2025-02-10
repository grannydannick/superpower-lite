import { AlertTriangleIcon } from 'lucide-react';
import { useState } from 'react';

import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useGetServiceability } from '@/features/orders/api';
import { AddAddressForm } from '@/features/settings/components/profile/add-address-form';
import { FormAddressInput, useUpdateProfile } from '@/features/users/api';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { Address } from '@/types/api';

function FullPrimaryAddressForm({
  googleAddres,
}: {
  googleAddres: FormAddressInput;
}) {
  const { data: user } = useUser();
  const { nextOnboardingStep, updatingStep } = useStepper((s) => s);
  const { setIsZipBlocked } = useOnboarding();

  const getServiceabilityMutation = useGetServiceability();
  const updateProfileMutation = useUpdateProfile();

  const defaultValues = {
    line1: googleAddres.line1,
    line2: googleAddres.line2,
    postalCode: googleAddres.postalCode,
    city: googleAddres.city,
    state: googleAddres.state,
  };

  const onSubmit = async (data: FormAddressInput) => {
    if (!user) {
      return;
    }

    const { serviceable } = await getServiceabilityMutation.mutateAsync({
      data: {
        zipCode: data.postalCode,
        collectionMethod: 'IN_LAB',
      },
    });

    if (serviceable) {
      const line = [data.line1];

      if (data.line2) {
        line.push(data.line2);
      }

      const address: Address = {
        line: line,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        text: data.text,
      };

      await updateProfileMutation.mutateAsync({
        data: { primaryAddress: { address } },
      });

      setIsZipBlocked(false);
      await nextOnboardingStep(user.onboarding.id);
    } else {
      setIsZipBlocked(true);
    }
  };

  if (getServiceabilityMutation.isError) {
    return (
      <Alert className="border-white/20 bg-white/5 p-4">
        <AlertTriangleIcon color="white" className="size-4" />
        <AlertTitle className="text-white">Check back in 24 hours</AlertTitle>
        <AlertDescription className="text-zinc-200">
          Due to high demand, availability is currently limited in your area. We
          are working on it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <AddAddressForm
      formFooter={
        <div>
          <Button
            type="submit"
            variant="white"
            className="w-full"
            disabled={updatingStep || !user}
          >
            {getServiceabilityMutation.isPending ? (
              <Spinner variant="primary" />
            ) : (
              'Confirm'
            )}
          </Button>
        </div>
      }
      theme="glass"
      onFormSubmit={onSubmit}
      defaultValues={defaultValues}
    />
  );
}

export function PrimaryAddressForm() {
  const [googleAddress, setGoogleAddress] = useState<
    FormAddressInput | undefined
  >();

  if (googleAddress) {
    return <FullPrimaryAddressForm googleAddres={googleAddress} />;
  }

  return (
    <AddressAutocomplete
      placeholder="Address"
      onSubmit={(address) => {
        setGoogleAddress(address);
      }}
    />
  );
}
