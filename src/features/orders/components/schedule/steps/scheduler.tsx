import { useEffect } from 'react';

import { IconList } from '@/components/shared/icon-list';
import { Scheduler } from '@/components/shared/scheduler';
import { Body1, H2, H4 } from '@/components/ui/typography';
import { SHARED_CONTAINER_STYLE } from '@/features/orders/const/config';
import { getCollectionInstructions } from '@/features/orders/utils/get-collection-instructions';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Slot } from '@/types/api';

import { WALK_IN_TEST_STEPS } from '../../../const/test-steps';
import { useScheduleStore } from '../../../stores/schedule-store';
import { ScheduleFlowFooter } from '../schedule-flow-footer';

export const SchedulerStep = () => {
  const { location, collectionMethod, updateSlot, updateTz, slot, mode } =
    useScheduleStore((s) => s);
  const { width } = useWindowDimensions();
  const { data: user } = useUser();

  if (!collectionMethod) {
    throw new Error(
      'Collection method must be defined to use PhlebotomyScheduler',
    );
  }

  const addressToUse = location?.address
    ? location.address
    : user?.primaryAddress;

  if (!addressToUse) {
    throw new Error(
      'Collection method must be defined to use PhlebotomyScheduler',
    );
  }

  const onSlotUpdate = (selectedSlot: Slot | null, tz?: string) => {
    if (selectedSlot) updateSlot(selectedSlot);
    if (tz) updateTz(tz);
  };

  const numDaysToShow = width > 600 ? 5 : 4;
  const instructions = getCollectionInstructions(collectionMethod);

  if (!location?.capabilities.includes('APPOINTMENT_SCHEDULING'))
    return <WalkInScheduler />;

  return (
    <>
      <div className={cn(SHARED_CONTAINER_STYLE)}>
        <div className="space-y-1 pb-4">
          <H2>Pick a time for your appointment</H2>
          <Body1 className="text-zinc-500">{instructions}</Body1>
        </div>
        <div className="w-full rounded-xl py-6">
          <Scheduler
            collectionMethod={collectionMethod}
            address={addressToUse}
            onSlotUpdate={onSlotUpdate}
            showCreateBtn={false}
            numDays={numDaysToShow}
            isAdvisory={mode === 'advisory-call'}
          />
        </div>
      </div>
      <ScheduleFlowFooter nextBtnDisabled={!slot} />
    </>
  );
};

const DAYS = [
  ['Mon', 'Monday'],
  ['Tue', 'Tuesday'],
  ['Wed', 'Wednesday'],
  ['Thu', 'Thursday'],
  ['Fri', 'Friday'],
  ['Sat', 'Saturday'],
  ['Sun', 'Sunday'],
] as const;

const WalkInScheduler = () => {
  const { location, updateSlot, updateTz } = useScheduleStore((s) => s);

  useEffect(() => {
    if (!location) return;

    if (!location.capabilities.includes('APPOINTMENT_SCHEDULING')) {
      updateSlot(null);
      updateTz(null);
    }
  }, [location, updateSlot, updateTz]);
  return (
    <>
      <div className={cn(SHARED_CONTAINER_STYLE, 'space-y-8')}>
        <div className="space-y-2">
          <H2>Visit during opening hours</H2>
          <Body1 className="text-zinc-500">
            No booking is required for your selected lab. You can walk in
            anytime during their opening hours. The visit takes about 15
            minutes. For best results, come within 2 hours after waking up
          </Body1>
        </div>
        <IconList items={WALK_IN_TEST_STEPS} />
        <div className="w-full space-y-4">
          <H4>Opening hours</H4>
          <div className="rounded-2xl border bg-white p-2 shadow-[0.2]">
            {DAYS.map(([key, label]) => {
              const hours = location?.hours?.[key] ?? 'Closed';

              return (
                <div
                  key={key}
                  className="flex items-center justify-between border-b px-2 py-4 last:border-0"
                >
                  <Body1>{label}</Body1>
                  <Body1 className={'text-secondary'}>{hours}</Body1>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ScheduleFlowFooter />
    </>
  );
};
