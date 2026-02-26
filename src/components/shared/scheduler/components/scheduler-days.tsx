import { TZDateMini, type TZDate } from '@date-fns/tz';
import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { Slot } from '@/types/api';

import { DEFAULT_DAYS_RANGE } from '../const';
import { dayArray } from '../utils';

import { SchedulerDaySlot } from './scheduler-day-slot';

interface SchedulerDaysProps {
  slots: Slot[];
  startRange?: TZDate;
  loading: boolean;
  selectedDay?: TZDate;
  tz: string;
  numDays?: number;
  onDaySelect: (day: TZDate) => void;
}

export const SchedulerDays = ({
  slots,
  startRange,
  loading,
  selectedDay,
  tz,
  numDays = DEFAULT_DAYS_RANGE,
  onDaySelect,
}: SchedulerDaysProps) => {
  const renderDays = startRange && slots.length > 0 && !loading;

  if (slots.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-3 py-10">
        <Body1 className="text-center text-zinc-500">
          We were unable to find available slots. Try next week
          <br />
        </Body1>
      </div>
    );
  }

  const skeletonNodes: React.ReactElement[] = [];
  if (loading) {
    const skeletonStart =
      startRange == null ? new TZDateMini(0, tz) : startRange;

    for (const day of dayArray(skeletonStart, numDays)) {
      skeletonNodes.push(
        <Skeleton
          className="h-[70px] w-full rounded-xl"
          key={day.toISOString()}
        />,
      );
    }
  }

  const dayNodes: React.ReactElement[] = [];
  if (renderDays) {
    for (const day of dayArray(startRange, numDays)) {
      dayNodes.push(
        <div key={day.toISOString()} className="flex w-full">
          <SchedulerDaySlot
            day={day}
            selectedDay={selectedDay}
            slots={slots}
            tz={tz}
            onDaySelect={onDaySelect}
          />
        </div>,
      );
    }
  }

  return (
    <div className="flex justify-start gap-2 overflow-x-auto">
      {skeletonNodes}
      {dayNodes}
    </div>
  );
};
