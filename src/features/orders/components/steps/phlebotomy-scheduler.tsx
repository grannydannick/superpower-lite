import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Scheduler } from '@/components/shared/scheduler';
import { Button } from '@/components/ui/button';
import { Body1, H2, H3 } from '@/components/ui/typography';
import {
  ADVANCED_BLOOD_PANEL,
  ADVISORY_CALL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { RecommendationDialog } from '@/features/orders/components/recommendation-dialog';
import { useOrder } from '@/features/orders/stores/order-store';
import { getCollectionInstructions } from '@/features/orders/utils/get-collection-instructions';
import { shouldUsePrimaryAddress } from '@/features/orders/utils/should-use-primary-address';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { Address, Slot } from '@/types/api';

import { PhlebotomyRecommendations } from '../phlebotomy-recommendations';

export const PhlebotomyScheduler = () => {
  const [showInlineRecs, setShowInlineRecs] = useState(true);

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
  const routerLocation = useLocation();

  const isOnboardingFlow = routerLocation.pathname.includes('/onboarding');

  const usePrimaryAddress = shouldUsePrimaryAddress(service, collectionMethod);

  // If not advisory and still no collectionMethod, throw an error
  if (!collectionMethod) {
    throw new Error(
      'Collection method must be defined to use PhlebotomyScheduler',
    );
  }

  useEffect(() => {
    if (usePrimaryAddress && !location?.address && user?.primaryAddress) {
      updateLocation({ address: user.primaryAddress });
    }
  }, [
    usePrimaryAddress,
    location?.address,
    user?.primaryAddress,
    updateLocation,
  ]);

  const onSlotUpdate = (selectedSlot: Slot | null, tz?: string) => {
    if (selectedSlot) updateSlot(selectedSlot);
    if (tz) setTz(tz);
  };

  const numDaysToShow = width > 600 ? 5 : 4;
  const instructions = getCollectionInstructions(collectionMethod);
  const addressToUse =
    usePrimaryAddress && user?.primaryAddress
      ? user.primaryAddress
      : location?.address;

  const isBloodTest =
    service.name === SUPERPOWER_BLOOD_PANEL ||
    service.name === ADVANCED_BLOOD_PANEL;

  const showInlineRecommendations = useMemo(() => {
    if (!isBloodTest) {
      return false;
    }

    if (!isOnboardingFlow) {
      return showInlineRecs;
    }

    return false;
  }, [isBloodTest, isOnboardingFlow, showInlineRecs]);

  const showModalRecommendations = useMemo(() => {
    return isOnboardingFlow && isBloodTest;
  }, [isOnboardingFlow, isBloodTest]);

  if (showInlineRecommendations) {
    return (
      <div className="px-6 pb-8 md:px-12">
        <H3 className="mb-6">Recommendations for testing</H3>
        <PhlebotomyRecommendations />
        <div className="sticky bottom-8 z-10 mt-8 flex w-full justify-end">
          <Button
            onClick={() => setShowInlineRecs(false)}
            className="w-full md:w-auto"
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 md:p-14">
        <div className="space-y-1 pb-4">
          <H2>Pick a time for your appointment</H2>
          <Body1 className="text-zinc-500">
            {service.name === ADVISORY_CALL ? undefined : instructions}
          </Body1>
        </div>
        <div className="w-full rounded-xl py-6">
          <Scheduler
            collectionMethod={collectionMethod}
            address={addressToUse as Address}
            service={service}
            onSlotUpdate={onSlotUpdate}
            displayCancellationNote={
              service.name === ADVISORY_CALL
                ? false
                : collectionMethod !== 'IN_LAB'
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

      {showModalRecommendations && <RecommendationDialog />}
    </>
  );
};
