import { useEffect } from 'react';

import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Address, CollectionMethodType, Slot } from '@/types/api';

import { SchedulerDays, SchedulerHeading, SchedulerTimes } from './components';
import { SchedulerStoreProvider, useScheduler } from './stores/scheduler';

interface Props {
  collectionMethod: CollectionMethodType;
  address: Address;
  onSlotUpdate?: (slot: Slot | null, tz: string) => void;
  className?: string;
  displayCancellationNote?: boolean;
  isAdvisory?: boolean;
  selectedSlot?: Slot | null;
}

/*
 * Scheduler component lets you schedule times with specific timezone (tz)
 *
 * If showCreateBtn is not passed, onCreate should be passed
 *
 * showCreateBtn is true by default, you can disable it if needed
 * */
export function Scheduler(props: Props) {
  const {
    className,
    collectionMethod,
    address,
    displayCancellationNote = false,
    isAdvisory = false,
    selectedSlot,
    ...rest
  } = props;

  return (
    <SchedulerStoreProvider
      address={address}
      collectionMethod={collectionMethod}
      isAdvisory={isAdvisory}
      {...rest}
    >
      <SchedulerConsumer
        className={className}
        displayCancellationNote={displayCancellationNote}
        selectedSlot={selectedSlot}
      />
    </SchedulerStoreProvider>
  );
}

function SchedulerConsumer({
  className,
  displayCancellationNote = false,
  selectedSlot,
}: {
  className?: string;
  displayCancellationNote?: boolean;
  selectedSlot?: Slot | null;
}): JSX.Element {
  const {
    slots,
    fetchSlots,
    startRange,
    loading,
    error,
    tz,
    selectedDay,
    updateSelectedDay,
    updateStartRange,
    onSlotUpdate,
  } = useScheduler((s) => s);

  useEffect(
    () => {
      fetchSlots();
    },
    // fetchLocations is stable from zustand, no need to put it in deps
    [],
  );

  const handleSlotSelect = (slot: Slot) => {
    onSlotUpdate?.(slot, tz);
  };

  const handleSelectionClear = () => {
    updateSelectedDay(undefined);
    onSlotUpdate?.(null, tz);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 px-3 py-10">
        <Body1 className="text-red-600">{error}</Body1>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-8', className)}>
      <div className="space-y-6">
        <SchedulerHeading
          startRange={startRange}
          tz={tz}
          loading={loading}
          onRangeChange={updateStartRange}
          onSelectionClear={handleSelectionClear}
        />
        <SchedulerDays
          slots={slots}
          startRange={startRange}
          loading={loading}
          selectedDay={selectedDay}
          tz={tz}
          onDaySelect={updateSelectedDay}
        />
      </div>
      <div>
        <SchedulerTimes
          slots={slots}
          selectedDay={selectedDay}
          selectedSlot={selectedSlot}
          loading={loading}
          startRange={startRange}
          tz={tz}
          onSlotSelect={handleSlotSelect}
        />
        {displayCancellationNote && slots.length > 0 ? (
          <div className="mt-6">
            <Body1 className="text-zinc-500">
              Rescheduling or cancelling less than 24 hours in advance of your
              scheduled appointment will result in a re-booking fee. Refer to
              our Terms of Service for more details.
            </Body1>
          </div>
        ) : null}
      </div>
    </div>
  );
}
