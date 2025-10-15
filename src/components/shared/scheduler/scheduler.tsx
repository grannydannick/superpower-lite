import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Body1 } from '@/components/ui/typography';
import { getAtHomePrice } from '@/const';
import { cn } from '@/lib/utils';
import {
  Address,
  CollectionMethodType,
  HealthcareService,
  Slot,
} from '@/types/api';
import { formatMoney } from '@/utils/format-money';

import { SchedulerDays, SchedulerHeading, SchedulerTimes } from './components';
import { SchedulerStoreProvider, useScheduler } from './stores/scheduler';

interface Props {
  collectionMethod: CollectionMethodType;
  address: Address;
  service: HealthcareService;
  onSlotUpdate?: (slot: Slot | null, tz: string) => void;
  numDays?: number;
  className?: string;
  displayCancellationNote?: boolean;
  showCreateBtn?: boolean;
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
    service,
    numDays,
    displayCancellationNote = false,
    showCreateBtn = true,
    ...rest
  } = props;

  return (
    <SchedulerStoreProvider
      address={address}
      service={service}
      collectionMethod={collectionMethod}
      numDays={numDays}
      showCreateBtn={showCreateBtn}
      {...rest}
    >
      <SchedulerConsumer
        className={className}
        displayCancellationNote={displayCancellationNote}
        showCreateBtn={showCreateBtn}
        address={address}
      />
    </SchedulerStoreProvider>
  );
}

function SchedulerConsumer({
  className,
  displayCancellationNote = false,
  showCreateBtn = false,
  address,
}: {
  className?: string;
  displayCancellationNote?: boolean;
  showCreateBtn?: boolean;
  address: Address;
}): JSX.Element {
  const { selectedSlot, slots, onSlotUpdate, fetchSlots, tz, startRange } =
    useScheduler((s) => s);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots, startRange]);

  const atHomePrice = getAtHomePrice(address.state);

  return (
    <div className={cn('w-full space-y-10', className)}>
      <div className="flex flex-col justify-end">
        <div className="mb-2">
          <SchedulerHeading />
        </div>
        <SchedulerDays />
        <SchedulerTimes />
        {displayCancellationNote && slots.length > 0 ? (
          <div className="mt-6">
            <Body1 className="text-zinc-500">
              Rescheduling or cancelling less than 24 hours in advance of your
              scheduled appointment will result in a {formatMoney(atHomePrice)}{' '}
              re-booking fee. Refer to our Terms of Service for more details.
            </Body1>
          </div>
        ) : null}
        {showCreateBtn && onSlotUpdate && (
          <div className="mt-6 flex justify-end">
            <Button
              disabled={!selectedSlot}
              onClick={() => {
                selectedSlot && onSlotUpdate(selectedSlot, tz);
              }}
              className="rounded-xl bg-[#18181B] px-8 py-4 text-white hover:bg-[#18181B]/80"
            >
              Confirm Appointment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
