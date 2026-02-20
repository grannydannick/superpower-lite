import { Moment } from 'moment';
import 'moment-timezone';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { Slot } from '@/types/api';

import { DEFAULT_DAYS_RANGE } from '../const';
import { dayArray } from '../utils';

import { SchedulerDaySlot } from './scheduler-day-slot';

interface SchedulerDaysProps {
  slots: Slot[];
  startRange?: Moment;
  loading: boolean;
  selectedDay?: Moment;
  tz: string;
  numDays?: number;
  onDaySelect: (day: Moment) => void;
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

  return (
    <div className="flex justify-start gap-2 overflow-x-auto">
      {loading &&
        Array(numDays)
          .fill(0)
          .map((_, indx) => (
            <Skeleton className="h-[70px] w-full rounded-xl" key={indx} />
          ))}
      {renderDays
        ? dayArray(startRange, numDays).map((day: Moment): JSX.Element => {
            return (
              <div key={day.format()} className="flex w-full">
                <SchedulerDaySlot
                  day={day}
                  selectedDay={selectedDay}
                  slots={slots}
                  tz={tz}
                  onDaySelect={onDaySelect}
                />
              </div>
            );
          })
        : null}
    </div>
  );
};
