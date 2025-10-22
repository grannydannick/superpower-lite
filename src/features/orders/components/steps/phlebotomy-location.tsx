import { CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, Body3, H2, H4 } from '@/components/ui/typography';
import {
  useGetServiceability,
  usePhlebotomyLocations,
} from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { LocationList } from '@/features/orders/components/locations-list';
import { HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE } from '@/features/orders/const/config';
import { useOrder } from '@/features/orders/stores/order-store';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
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

  return (
    <>
      <div
        className={cn('space-y-8', HEALTHCARE_SERVICE_DIALOG_CONTAINER_STYLE)}
      >
        <div className="space-y-2">
          <H2>Where would you like to get tested?</H2>
          <Body1 className="text-secondary">
            Select an in-person lab test or at-home visit.
          </Body1>
        </div>
        <div className="space-y-4">
          <CreateOrderPhlebotomyLocationSelector />
          <Body3 className="text-zinc-400">
            Late cancellation or rescheduling fees apply.
          </Body3>
        </div>
        {collectionMethod === 'IN_LAB' ? <CreateOrderPhlebotomyInLab /> : null}
        {collectionMethod === 'AT_HOME' ||
        collectionMethod === 'PHLEBOTOMY_KIT' ? (
          <CreateOrderPhlebotomyAtHome />
        ) : null}
      </div>
      <HealthcareServiceFooter nextBtnDisabled={!location} />
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
    : 'No locations found. Please enter a new ZIP code.';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <H4>We will find a lab for you</H4>
        <Body1 className="text-zinc-500">
          Please provide us your ZIP code.
        </Body1>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Body2 className={hasError ? 'text-pink-700' : 'text-secondary'}>
            Zip code <span className="text-vermillion-900">*</span>
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
            placeholder="5-digit ZIP code"
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
      <div className="space-y-4">
        <H4>Available clinics</H4>
        <LocationList
          locations={phlebotomyLocationsMutation.data?.locations}
          isLoading={phlebotomyLocationsMutation.isLoading}
        />
      </div>
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

      const { postalCode } = user.primaryAddress;

      const response = await mutateAsync({
        data: {
          zipCode: postalCode,
          collectionMethod: collectionMethod || 'AT_HOME',
        },
      });

      if (response.serviceable) {
        updateLocation({
          address: user.primaryAddress,
          name: 'home',
          capabilities: ['APPOINTMENT_SCHEDULING'],
        });
      } else {
        updateLocation(null);
      }
    };

    checkServiceable();
  }, [collectionMethod, user?.primaryAddress]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <H4>Place of service</H4>
      </div>

      <CurrentAddressCard
        className={cn(
          !isPending && !isServiceable && user?.primaryAddress
            ? 'border-pink-700 bg-pink-50'
            : null,
        )}
        disableEdit={true}
      />

      {!isServiceable && !isPending && user?.primaryAddress ? (
        <Body2 className="text-pink-700">
          Sorry, at-home service is currently not available in your area. Please
          go back and try a different address or contact support for assistance.
        </Body2>
      ) : null}
    </div>
  );
}
