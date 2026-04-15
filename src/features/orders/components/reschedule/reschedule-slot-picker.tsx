import { APIProvider } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

import { LocationsScheduler, Scheduler } from '@/components/shared/scheduler';
import { NumericInput } from '@/components/ui/input';
import { Body2 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation, RequestGroup, Slot } from '@/types/api';

import { useGetServiceability } from '../../api';

export const RescheduleSlotPicker = ({
  requestGroup,
  selectedSlot,
  selectedLocation,
  onSlotSelected,
  onLocationSelected,
  onTzSelected,
}: {
  requestGroup: RequestGroup;
  selectedSlot: Slot | null;
  selectedLocation: PhlebotomyLocation | null;
  onSlotSelected: (slot: Slot | null) => void;
  onLocationSelected: (location: PhlebotomyLocation | null) => void;
  onTzSelected: (tz: string | null) => void;
}) => {
  const isAtHome = requestGroup.collectionMethod === 'AT_HOME';

  if (isAtHome) {
    return (
      <AtHomeSlotPicker
        requestGroup={requestGroup}
        selectedSlot={selectedSlot}
        onSlotSelected={onSlotSelected}
        onLocationSelected={onLocationSelected}
        onTzSelected={onTzSelected}
      />
    );
  }

  return (
    <InLabSlotPicker
      requestGroup={requestGroup}
      selectedSlot={selectedSlot}
      selectedLocation={selectedLocation}
      onSlotSelected={onSlotSelected}
      onLocationSelected={onLocationSelected}
      onTzSelected={onTzSelected}
    />
  );
};

const AtHomeSlotPicker = ({
  requestGroup,
  selectedSlot,
  onSlotSelected,
  onLocationSelected,
  onTzSelected,
}: {
  requestGroup: RequestGroup;
  selectedSlot: Slot | null;
  onSlotSelected: (slot: Slot | null) => void;
  onLocationSelected: (location: PhlebotomyLocation | null) => void;
  onTzSelected: (tz: string | null) => void;
}) => {
  const { data: user } = useUser();

  const serviceabilityQuery = useGetServiceability();
  const { mutateAsync, isPending } = serviceabilityQuery;
  const isServiceable = serviceabilityQuery.data?.serviceable;

  useEffect(() => {
    const checkServiceable = async (): Promise<void> => {
      if (!user?.primaryAddress) {
        return;
      }

      const { postalCode } = user.primaryAddress;

      const response = await mutateAsync({
        data: {
          zipCode: postalCode,
          collectionMethod: requestGroup.collectionMethod || 'AT_HOME',
        },
      });

      if (response.serviceable) {
        onLocationSelected({
          address: user.primaryAddress,
          name: 'home',
          capabilities: ['APPOINTMENT_SCHEDULING'],
          slots: [],
        });
      } else {
        onLocationSelected(null);
      }
    };

    checkServiceable();
  }, [
    requestGroup.collectionMethod,
    user?.primaryAddress,
    mutateAsync,
    onLocationSelected,
  ]);

  const handleSelectionChange = (slot: Slot | null, tz: string) => {
    onSlotSelected(slot);
    onTzSelected(tz);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <CurrentAddressCard
          className={cn(
            !isPending && !isServiceable && user?.primaryAddress
              ? 'border-pink-700 bg-pink-50'
              : null,
          )}
        />
        {!isServiceable && !isPending && user?.primaryAddress ? (
          <Body2 className="text-pink-700">
            Sorry, at-home service is currently not available in your area.
            Please go back and try a different address or contact support for
            assistance.
          </Body2>
        ) : null}
      </div>

      {user?.primaryAddress &&
      isServiceable &&
      requestGroup.collectionMethod ? (
        <Scheduler
          address={user.primaryAddress}
          onSlotUpdate={handleSelectionChange}
          selectedSlot={selectedSlot}
          collectionMethod={requestGroup.collectionMethod}
        />
      ) : null}
    </div>
  );
};

const InLabSlotPicker = ({
  requestGroup,
  selectedSlot,
  selectedLocation,
  onSlotSelected,
  onLocationSelected,
  onTzSelected,
}: {
  requestGroup: RequestGroup;
  selectedSlot: Slot | null;
  selectedLocation: PhlebotomyLocation | null;
  onSlotSelected: (slot: Slot | null) => void;
  onLocationSelected: (location: PhlebotomyLocation | null) => void;
  onTzSelected: (tz: string | null) => void;
}) => {
  const { data: user } = useUser();

  const [zipCode, setZipCode] = useState<string>(
    requestGroup.address?.postalCode ?? user?.primaryAddress?.postalCode ?? '',
  );

  const handleSelectionChange = (
    location: PhlebotomyLocation | null,
    slot: Slot | null,
    tz: string,
  ) => {
    onLocationSelected(location);
    onSlotSelected(slot);
    onTzSelected(tz);
  };

  return (
    <APIProvider apiKey={env.GOOGLE_API_KEY} libraries={['places']}>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Body2 className="text-secondary">
              Zip code <span className="text-vermillion-900">*</span>
            </Body2>
          </div>
          <div>
            <NumericInput
              value={zipCode}
              onChange={(value: string) => setZipCode(value)}
              maxLength={5}
              maxDigits={5}
              placeholder="5-digit ZIP code"
            />
          </div>
        </div>
        <div className="space-y-4">
          <LocationsScheduler
            postalCode={zipCode}
            onSelectionChange={handleSelectionChange}
            selectedSlot={selectedSlot}
            selectedLocation={selectedLocation}
          />
        </div>
      </div>
    </APIProvider>
  );
};
