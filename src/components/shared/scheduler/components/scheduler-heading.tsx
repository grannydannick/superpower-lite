import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import 'moment-timezone';

import { Spinner } from '@/components/ui/spinner';

import { useScheduler } from '../stores/scheduler';

import { RangeSelectButton } from './range-select-button';

export function SchedulerHeading(): JSX.Element {
  const {
    updateSelectedDay,
    tz,
    slots,
    updateStartRange,
    startRange,
    numDays,
    updateSelectedSlot,
    onSlotUpdate,
    showCreateBtn,
    loading,
  } = useScheduler((s) => s);

  const handleClick = async (numDays: number) => {
    if (!startRange) return;

    const newStartRange = startRange.clone().add(numDays, 'days').tz(tz);

    updateStartRange(newStartRange);
    updateSelectedDay(undefined);
    updateSelectedSlot(undefined);

    // additional callback if native button is hidden
    onSlotUpdate && !showCreateBtn && onSlotUpdate(null, tz);
  };

  return (
    <div className="flex justify-between text-[#71717A]">
      <h5 className="flex flex-row items-center justify-start space-x-2 tracking-wider">
        <span>{startRange?.tz(tz).format('MMMM')}</span>
      </h5>
      <div className="flex flex-row items-center">
        <div className="flex flex-row items-center">
          {loading ? (
            <span className="flex size-6 items-center">
              <Spinner variant="primary" />
            </span>
          ) : null}
          {slots.length ? (
            <>
              <RangeSelectButton
                icon={<ChevronLeft className="size-4" />}
                onClick={() => {
                  numDays && handleClick(-numDays);
                }}
              />
              <RangeSelectButton
                icon={<ChevronRight className="size-4" />}
                onClick={() => {
                  numDays && handleClick(numDays);
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
