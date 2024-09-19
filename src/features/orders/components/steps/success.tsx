import React from 'react';

import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Timeline } from '@/components/ui/timeline';
import { H2 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { getServiceTimeline } from '@/utils/service';

export const Success = () => {
  const { slot, service, collectionMethod, location } = useOrder((s) => s);
  const timeline = getServiceTimeline(service);

  return (
    <>
      <div className="space-y-8 p-6 md:p-14">
        <H2 className="text-zinc-900">
          Thank you, we look forward to seeing you shortly.
        </H2>
        <Timeline timeline={timeline} />
      </div>
      <div className="flex w-full flex-col gap-3 px-6 pb-12 md:flex-row md:justify-end md:px-14">
        {location?.address && collectionMethod && slot && (
          <AddToCalendar
            address={location.address}
            slot={slot}
            service={
              (service.name as 'Superpower Blood Panel') ||
              'Grail Galleri Multi Cancer Test'
            }
            collectionMethod={collectionMethod}
            className="max-w-none"
          />
        )}
        <DialogClose>
          <Button className="w-full md:w-auto">Done</Button>
        </DialogClose>
      </div>
    </>
  );
};
