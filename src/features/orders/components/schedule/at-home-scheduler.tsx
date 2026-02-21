import { useEffect } from 'react';

import { Scheduler } from '@/components/shared/scheduler';
import { Body2 } from '@/components/ui/typography';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Slot } from '@/types/api';

import { useGetServiceability } from '../../api';
import { useScheduleStore } from '../../stores/schedule-store';

export const AtHomeScheduler = () => {
  const { data: user } = useUser();

  const { updateLocation, collectionMethod, slot, updateSlot, updateTz } =
    useScheduleStore((s) => s);

  const handleSelectionChange = (slot: Slot | null, tz: string) => {
    updateSlot(slot);
    updateTz(tz);
  };

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
          collectionMethod: collectionMethod || 'AT_HOME',
        },
      });

      if (response.serviceable) {
        updateLocation({
          address: user.primaryAddress,
          name: 'home',
          capabilities: ['APPOINTMENT_SCHEDULING'],
          slots: [],
        });
      } else {
        updateLocation(null);
      }
    };

    checkServiceable();
  }, [collectionMethod, user?.primaryAddress, mutateAsync, updateLocation]);

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

      {user?.primaryAddress && isServiceable && collectionMethod ? (
        <Scheduler
          address={user?.primaryAddress}
          onSlotUpdate={handleSelectionChange}
          selectedSlot={slot}
          collectionMethod={collectionMethod}
        />
      ) : null}
    </div>
  );
};
