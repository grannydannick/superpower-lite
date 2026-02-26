import { TZDateMini, tzName, type TZDate } from '@date-fns/tz';
import { isSameDay } from 'date-fns';
import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { Slot } from '@/types/api';

import { SchedulerTimeSlot } from './scheduler-time-slot';

const TIME_SKELETON_KEYS = ['t1', 't2', 't3', 't4'];

interface SchedulerTimesProps {
  slots: Slot[];
  selectedDay?: TZDate;
  selectedSlot?: Slot | null;
  loading: boolean;
  startRange?: TZDate;
  tz: string;
  onSlotSelect: (slot: Slot) => void;
}

export const SchedulerTimes = ({
  slots,
  selectedDay,
  selectedSlot,
  loading,
  startRange,
  tz,
  onSlotSelect,
}: SchedulerTimesProps) => {
  if (selectedDay == null) return null;

  const timeSlots: Slot[] = [];
  for (const slot of slots) {
    const slotStart = new TZDateMini(slot.start, tz);
    if (isSameDay(selectedDay, slotStart)) {
      timeSlots.push(slot);
    }
  }

  if (loading === false && timeSlots.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed px-3 py-10">
        <Body1 className="text-zinc-500">No times found.</Body1>
      </div>
    );
  }

  let timeZoneAbbreviation: string | null = null;
  if (startRange != null && loading === false) {
    try {
      timeZoneAbbreviation = tzName(tz, startRange, 'short');
    } catch {
      timeZoneAbbreviation = null;
    }
  }

  const timeSlotNodes: React.ReactElement[] = [];
  if (loading === false) {
    for (const slot of timeSlots) {
      timeSlotNodes.push(
        <SchedulerTimeSlot
          key={slot.start}
          timeSlot={slot}
          selectedSlot={selectedSlot}
          tz={tz}
          onSlotSelect={onSlotSelect}
        />,
      );
    }
  }

  const skeletonTimeNodes: React.ReactElement[] = [];
  if (loading) {
    for (const key of TIME_SKELETON_KEYS) {
      skeletonTimeNodes.push(
        <Skeleton className="h-[46px] w-full rounded-xl" key={key} />,
      );
    }
  }

  return (
    <>
      {startRange != null && loading === false ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <Body1 className="text-sm text-zinc-500 sm:text-base">
            Available time slots
          </Body1>
          <Body1 className="text-sm text-zinc-500 sm:text-base">
            {/* e.g. "PDT" */}
            {timeZoneAbbreviation}
          </Body1>
        </div>
      ) : null}
      {loading ? (
        <Skeleton className="mb-2 h-5 w-full max-w-[230px] md:h-6" />
      ) : null}
      <div className="flex flex-nowrap gap-2 overflow-x-auto sm:flex-wrap">
        {loading ? skeletonTimeNodes : timeSlotNodes}
      </div>
    </>
  );
};
