import React from 'react';

import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { H2 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { useOrder } from '@/features/orders/stores/order-store';
import { getServiceTimeline } from '@/utils/service';
import { AnimatedTimeline } from 'src/components/ui/animated-timeline';

export const Success = () => {
  const { slot, service, collectionMethod, location, onSubmit } = useOrder(
    (s) => s,
  );
  const steps = getServiceTimeline(service, collectionMethod);

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
        <AnimatedTimeline timeline={steps} />
      </div>
      <div className="flex w-full flex-col gap-3 px-6 pb-12 md:w-auto md:flex-row md:justify-end md:px-14">
        {renderCalendarButton()}
        <DialogClose>
          <Button
            className="w-full md:w-auto"
            onClick={onSubmit ? onSubmit : undefined}
          >
            Done
          </Button>
        </DialogClose>
      </div>
    </>
  );
};
