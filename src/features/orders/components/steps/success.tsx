import React from 'react';

import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { H2 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { useStepper } from '@/lib/stepper';
import { getServiceTimeline } from '@/utils/service';
import { AnimatedTimeline } from 'src/components/ui/animated-timeline';

export const Success = () => {
  const { slot, service, collectionMethod, location } = useOrder((s) => s);
  const { nextStep, activeStep, steps } = useStepper((s) => s);
  const timelineSteps = getServiceTimeline(service, collectionMethod);

  const isLastStep = activeStep === steps.length - 1;

  const renderCalendarButton = () => {
    if (!location?.address) {
      return null;
    }
    if (!collectionMethod) {
      return null;
    }
    if (!slot) {
      return null;
    }
    if (
      service.name !== SUPERPOWER_BLOOD_PANEL &&
      service.name !== GRAIL_GALLERI_MULTI_CANCER_TEST
    ) {
      return null;
    }

    return (
      <AddToCalendar
        address={location.address}
        slot={slot}
        service={service.name}
        collectionMethod={collectionMethod}
        className="max-w-none md:max-w-[244px]"
      />
    );
  };

  return (
    <>
      <div className="space-y-8 p-6 md:p-14">
        <H2 className="text-zinc-900">
          Thank you, we look forward to seeing you shortly.
        </H2>
        <AnimatedTimeline timeline={timelineSteps} />
      </div>
      <HealthcareServiceFooter
        prevBtn={renderCalendarButton()}
        nextBtn={
          isLastStep ? (
            <DialogClose>
              <Button className="w-full md:w-auto">Done</Button>
            </DialogClose>
          ) : (
            <Button onClick={nextStep} className="w-full md:w-auto">
              Next
            </Button>
          )
        }
      />
    </>
  );
};
