import moment from 'moment-timezone';

import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { Slot } from '@/types/api';

import { SchedulerTimeSlot } from './scheduler-time-slot';

interface SchedulerTimesProps {
  slots: Slot[];
  selectedDay?: moment.Moment;
  selectedSlot?: Slot | null;
  loading: boolean;
  startRange?: moment.Moment;
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
  if (!selectedDay) return null;

  const timeSlots = slots.filter((a: Slot) =>
    selectedDay?.isSame(moment(a.start), 'day'),
  );

  if (!loading && timeSlots.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed px-3 py-10">
        <Body1 className="text-zinc-500">No times found.</Body1>
      </div>
    );
  }

  return (
    <>
      {startRange && !loading ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <Body1 className="text-sm text-zinc-500 sm:text-base">
            Available time slots
          </Body1>
          <Body1 className="text-sm text-zinc-500 sm:text-base">
            {/*For Pacific Daylight Time, 'z' would output 'PDT'.*/}
            {startRange ? startRange.format('z') : null}
          </Body1>
        </div>
      ) : null}
      {loading ? (
        <Skeleton className="mb-2 h-5 w-full max-w-[230px] md:h-6" />
      ) : null}
      <div className="flex flex-nowrap gap-2 overflow-x-auto sm:flex-wrap">
        {loading &&
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton className="h-[46px] w-full rounded-xl" key={i} />
            ))}
        {!loading &&
          timeSlots.map((slot: Slot) => {
            return (
              <SchedulerTimeSlot
                key={slot.start}
                timeSlot={slot}
                selectedSlot={selectedSlot}
                tz={tz}
                onSlotSelect={onSlotSelect}
              />
            );
          })}
      </div>
    </>
  );
};
