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
    <div className="space-y-16">
      <H2 className="text-zinc-900">
        Thank you, we look forward to seeing you shortly.
      </H2>
      <Timeline timeline={timeline} />
      <div className="flex w-full justify-end gap-3 py-12">
        {location?.address && collectionMethod && slot && (
          <AddToCalendar
            address={location.address}
            slot={slot}
            service={
              (service.name as 'Superpower Blood Panel') ||
              'Grail Galleri Multi Cancer Test'
            }
            collectionMethod={collectionMethod}
          />
        )}
        <DialogClose>
          <Button>Done</Button>
        </DialogClose>
      </div>
    </div>
  );
};
