import { useEffect } from 'react';

import { Scheduler } from '@/components/shared/scheduler';
import { Body1, H2 } from '@/components/ui/typography';
import { SHARED_CONTAINER_STYLE } from '@/features/orders/const/config';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Slot } from '@/types/api';

import { useScheduleStore } from '../../../stores/schedule-store';
import { ScheduleFlowFooter } from '../schedule-flow-footer';

export const AdvisorySchedulerStep = () => {
  const { updateSlot, updateTz, slot, updateLocation } = useScheduleStore(
    (s) => s,
  );
  const { width } = useWindowDimensions();
  const { data: user } = useUser();

  const addressToUse = user?.primaryAddress;

  useEffect(() => {
    if (!addressToUse) return;

    // fake location so we can properly process it later
    updateLocation({
      address: addressToUse,
      name: 'ZOOM',
      capabilities: [],
    });
  }, [addressToUse, updateLocation]);

  if (!addressToUse) {
    return <Body1 className="text-pink-500">No primary address found</Body1>;
  }

  const onSlotUpdate = (selectedSlot: Slot | null, tz?: string) => {
    if (selectedSlot) updateSlot(selectedSlot);
    if (tz) updateTz(tz);
  };

  const numDaysToShow = width > 600 ? 5 : 4;

  return (
    <>
      <div className={cn(SHARED_CONTAINER_STYLE)}>
        <div className="space-y-1 pb-4">
          <H2>Pick a time for your appointment</H2>
        </div>
        <div className="w-full rounded-xl py-6">
          <Scheduler
            collectionMethod={'AT_HOME'}
            address={addressToUse}
            onSlotUpdate={onSlotUpdate}
            showCreateBtn={false}
            numDays={numDaysToShow}
            isAdvisory={true}
          />
        </div>
      </div>
      <ScheduleFlowFooter nextBtnDisabled={!slot} />
    </>
  );
};
