import { useEffect } from 'react';

import { Scheduler } from '@/components/shared/scheduler';
import { Button } from '@/components/ui/button';
import { Body1, H2 } from '@/components/ui/typography';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { getCollectionInstructions } from '@/features/orders/utils/get-collection-instructions';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { Address, Slot } from '@/types/api';

export const PhlebotomyScheduler = () => {
  const {
    service,
    location,
    collectionMethod,
    updateSlot,
    setTz,
    slot,
    updateLocation,
  } = useOrder((s) => s);
  const { width } = useWindowDimensions();
  const nextStep = useStepper((s) => s.nextStep);
  const { data: user } = useUser();

  const isAdvisoryCall = service.id === '1-1-advisory-call';

  // If not advisory and still no collectionMethod, throw an error
  if (!collectionMethod) {
    throw new Error(
      'Collection method must be defined to use PhlebotomyScheduler',
    );
  }

  /**
   * '/availability' requires address body so we update the current order location to member's primary address
   * this is only needed for advisory calls
   */
  useEffect(() => {
    if (isAdvisoryCall && !location?.address && user?.primaryAddress) {
      updateLocation({ address: user.primaryAddress });
    }
  }, [isAdvisoryCall, location?.address, user?.primaryAddress, updateLocation]);

  const onSlotUpdate = (selectedSlot: Slot | null, tz?: string) => {
    if (selectedSlot) updateSlot(selectedSlot);
    if (tz) setTz(tz);
  };

  const numDaysToShow = width > 600 ? 5 : 4;
  const instructions = getCollectionInstructions(collectionMethod);

  const addressToUse =
    isAdvisoryCall && user?.primaryAddress
      ? user.primaryAddress
      : location?.address;

  return (
    <>
      <div className="p-6 md:p-14">
        <div className="space-y-1 pb-4">
          <H2>Pick a time for your appointment</H2>
          <Body1 className="text-zinc-500">
            {isAdvisoryCall ? undefined : instructions}
          </Body1>
        </div>
        <div className="w-full rounded-xl py-6">
          <Scheduler
            collectionMethod={collectionMethod}
            address={addressToUse as Address}
            serviceId={service.id}
            onSlotUpdate={onSlotUpdate}
            displayCancellationNote={
              isAdvisoryCall ? false : collectionMethod !== 'IN_LAB'
            }
            showCreateBtn={false}
            numDays={numDaysToShow}
          />
        </div>
      </div>
      <HealthcareServiceFooter
        nextBtn={
          <Button
            onClick={nextStep}
            disabled={!slot}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        }
      />
    </>
  );
};
