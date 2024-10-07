import { Moment } from 'moment';
import { useEffect } from 'react';
import 'moment-timezone';

import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';

import { useScheduler } from '../stores/scheduler';
import { dayArray, isDisabledDaySlot } from '../utils';

import { SchedulerDaySlot } from './scheduler-day-slot';

export function SchedulerDays(): JSX.Element {
  const {
    selectedDay,
    slots,
    updateSelectedDay,
    startRange,
    numDays,
    loading,
  } = useScheduler((s) => s);

  useEffect(() => {
    if (!startRange || !numDays) return;

    for (const day of dayArray(startRange, numDays).reverse()) {
      if (!selectedDay && !isDisabledDaySlot(day, slots)) {
        updateSelectedDay(day);
      }
    }
  }, [slots]);

  const renderDays = numDays && startRange && slots.length > 0 && !loading;

  if (slots.length === 0 && !loading) {
    return (
      <div className="mb-8 flex items-center justify-center sm:h-[200px]">
        <Body1 className="text-center text-zinc-500">No slots found.</Body1>
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col justify-start gap-2 sm:h-[200px] sm:flex-row">
      {loading &&
        Array(numDays)
          .fill(0)
          .map((_, indx) => (
            <Skeleton
              className="h-[60px] w-full min-w-fit rounded-2xl sm:h-[200px]"
              key={indx}
            />
          ))}
      {renderDays
        ? dayArray(startRange, numDays).map((day: Moment): JSX.Element => {
            return (
              <div key={day.format()} className="flex w-full">
                <SchedulerDaySlot day={day} />
              </div>
            );
          })
        : null}
    </div>
  );
}
