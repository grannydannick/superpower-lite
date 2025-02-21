import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  useGetServiceability,
  usePhlebotomyLocations,
} from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { LocationList } from '@/features/orders/components/locations-list';
import { useOrder } from '@/features/orders/stores/order-store';
import { AddAddressForm } from '@/features/settings/components/profile/add-address-form';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useDebounce } from '@/hooks/use-debounce';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

import { CreateOrderPhlebotomyLocationSelector } from '../phlebotomy-location-selector';

/**
 * Idea here is:
 *
 * If user has primary address just show him two options to select either in lab (if possible) or at-home
 * Otherwise, force user to add primary address first
 */
export const PhlebotomyLocationSelect = () => {
  const { collectionMethod, location } = useOrder((s) => s);
  const nextStep = useStepper((s) => s.nextStep);
  const { data: user } = useUser();

  return (
    <>
      <div className="p-6 md:p-14">
        {user?.primaryAddress ? (
          <div className="space-y-8 md:space-y-16">
            <div className="space-y-4">
              <H2>Select a service type</H2>
              <CreateOrderPhlebotomyLocationSelector />
            </div>
            {collectionMethod === 'IN_LAB' ? (
              <CreateOrderPhlebotomyInLab />
            ) : null}
            {collectionMethod === 'AT_HOME' ||
            collectionMethod === 'PHLEBOTOMY_KIT' ? (
              <CreateOrderPhlebotomyAtHome />
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <H2>We do not have your primary address!</H2>
            <AddAddressForm />
          </div>
        )}
      </div>
      {user?.primaryAddress ? (
        <HealthcareServiceFooter
          nextBtn={
            <Button
              onClick={nextStep}
              disabled={!location}
              className="w-full md:w-auto"
            >
              Next
            </Button>
          }
        />
      ) : null}
    </>
  );
};

function CreateOrderPhlebotomyInLab(): JSX.Element {
  const { data: user } = useUser();
  const updateLocation = useOrder((s) => s.updateLocation);

  const [zipCode, setZipCode] = useState<string>(
    user?.primaryAddress?.address.postalCode ?? '',
  );
  const debouncedZipCode = useDebounce(zipCode, 500);
  const phlebotomyLocationsMutation = usePhlebotomyLocations({
    postalCode: debouncedZipCode,
    queryConfig: { enabled: debouncedZipCode.length === 5 },
  });

  useEffect(() => {
    if (zipCode.length !== 5) {
      updateLocation(null);
    }
  }, [zipCode]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <H2>Nearby Labs</H2>
        <Body1 className="text-zinc-500">
          Please enter your zip code and we will find a partner laboratory
          closest to you. After selecting a laboratory, you will be able to
          proceed to the next step.
        </Body1>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Body2 className="text-zinc-500">My zip code</Body2>
          {phlebotomyLocationsMutation.isLoading && (
            <span>
              <Spinner size="xs" variant="primary" />
            </span>
          )}
        </div>
        <Input
          maxLength={5}
          value={zipCode}
          placeholder="5-digit zip code"
          onChange={(e) => setZipCode(e.target.value)}
        />
      </div>
      <LocationList
        locations={phlebotomyLocationsMutation.data?.locations || []}
      />
    </div>
  );
}

function CreateOrderPhlebotomyAtHome(): JSX.Element {
  const { updateLocation, collectionMethod } = useOrder((s) => s);
  const { data: user } = useUser();

  const { data, mutateAsync, isPending } = useGetServiceability();
  const isServiceable = data?.serviceable;

  useEffect(() => {
    const checkServiceable = async (): Promise<void> => {
      if (!user?.primaryAddress) {
        return;
      }

      const { postalCode } = user.primaryAddress.address;

      const response = await mutateAsync({
        data: {
          zipCode: postalCode,
          collectionMethod: collectionMethod || 'AT_HOME',
        },
      });

      if (response.serviceable) {
        updateLocation({ address: user.primaryAddress.address });
      } else {
        updateLocation(null);
      }
    };

    checkServiceable();
  }, [collectionMethod, user?.primaryAddress]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <H2>Place of service</H2>
      </div>

      <CurrentAddressCard
        className={cn(
          !isPending && !isServiceable ? 'border-pink-700 bg-pink-50' : null,
        )}
      />

      {!isServiceable && !isPending ? (
        <Body2 className="text-pink-700">
          Sorry, we’re unable to service your area right now. please go back and
          try a different address.
        </Body2>
      ) : null}
    </div>
  );
}
