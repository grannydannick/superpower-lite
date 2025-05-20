import { CircleAlert } from 'lucide-react';
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
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
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
        ) : null}
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
    user?.primaryAddress?.postalCode ?? '',
  );

  const phlebotomyLocationsMutation = usePhlebotomyLocations({
    postalCode: zipCode,
    queryConfig: { enabled: zipCode.length === 5 },
  });

  useEffect(() => {
    if (zipCode.length !== 5) {
      updateLocation(null);
    }
  }, [zipCode, updateLocation]);

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setZipCode(value);
  };

  const isApiError = phlebotomyLocationsMutation.isError;
  const isValidZipCode = zipCode.length === 5;
  const isLoadingComplete = !phlebotomyLocationsMutation.isLoading;
  const hasNoLocations =
    !phlebotomyLocationsMutation.data?.locations ||
    phlebotomyLocationsMutation.data.locations.length === 0;

  const hasError =
    isApiError || (isValidZipCode && isLoadingComplete && hasNoLocations);

  const errorMessage = isApiError
    ? 'Error loading locations. Please try again.'
    : 'No locations found. Please enter a new zip code.';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <H2>Nearby Labs</H2>
        <Body1 className="text-zinc-500">
          Please enter your zip code and we will find a partner laboratory
          closest to you.
        </Body1>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Body2 className={hasError ? 'text-pink-700' : 'text-zinc-700'}>
            My zip code
          </Body2>
          {phlebotomyLocationsMutation.isLoading && (
            <span>
              <Spinner size="xs" variant="primary" />
            </span>
          )}
        </div>
        <div>
          <Input
            value={zipCode}
            onChange={handleZipCodeChange}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            placeholder="5-digit zip code"
            aria-invalid={hasError}
            variant={hasError ? 'error' : 'default'}
            aria-describedby={hasError ? 'zip-code-error' : undefined}
          />
          {hasError && (
            <div
              id="zip-code-error"
              className="mt-1.5 flex items-center gap-1.5"
            >
              <CircleAlert className="size-4 shrink-0 text-pink-700" />
              <Body2 className="text-pink-700">{errorMessage}</Body2>
            </div>
          )}
        </div>
      </div>
      <LocationList
        locations={phlebotomyLocationsMutation.data?.locations}
        isLoading={phlebotomyLocationsMutation.isLoading}
      />
    </div>
  );
}

function CreateOrderPhlebotomyAtHome(): JSX.Element {
  const { updateLocation, collectionMethod, isBookingModal } = useOrder(
    (s) => s,
  );
  const { data: user } = useUser();

  const { data, mutateAsync, isPending } = useGetServiceability();
  const isServiceable = data?.serviceable;

  useEffect(() => {
    const checkServiceable = async (): Promise<void> => {
      if (!user?.primaryAddress) {
        return;
      }

      const { postalCode } = user.primaryAddress;

      const response = await mutateAsync({
        data: {
          zipCode: postalCode,
          collectionMethod: collectionMethod || 'AT_HOME',
        },
      });

      if (response.serviceable) {
        updateLocation({ address: user.primaryAddress });
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
        disableEdit={isBookingModal}
      />

      {!isServiceable && !isPending ? (
        <Body2 className="text-pink-700">
          Sorry, at-home service is currently not available in your area. Please
          go back and try a different address or contact support for assistance.
        </Body2>
      ) : null}
    </div>
  );
}
