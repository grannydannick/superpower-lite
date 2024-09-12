import { DotIcon } from 'lucide-react';
import moment from 'moment';
import React from 'react';
import 'moment-timezone';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Slot } from '@/types/api';

import { useScheduler } from '../stores/scheduler';

import { SchedulerTimeSlot } from './scheduler-time-slot';

export function SchedulerTimes(): JSX.Element {
  const { selectedDay, slots, tz, loading } = useScheduler((s) => s);

  const timeSlots = slots.filter((a: Slot) =>
    selectedDay?.isSame(moment(a.start), 'day'),
  );

  return (
    <>
      {timeSlots.length > 0 && !loading ? (
        <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400 md:text-base">
          {moment(timeSlots[0]?.start).tz(tz).format('MMMM Do')}
          <DotIcon className="size-3" color="#71717A" />
          <h5 className="mr-1 tracking-wider">
            {fullAbbr(moment(timeSlots[0]?.start).tz(tz).format('zz'))}
          </h5>
        </div>
      ) : null}
      {loading ? (
        <Skeleton className="mb-2 h-5 w-full max-w-[230px] md:h-6" />
      ) : null}
      <div className="items-center text-center">
        <div
          className={cn(
            'p-2 rounded-2xl space-y-2 max-h-[270px] overflow-y-scroll',
            timeSlots.length > 0 || loading ? 'border border-[#E4E4E7]' : '',
          )}
        >
          {loading &&
            Array(5)
              .fill(0)
              .map((_, i) => <Skeleton className="h-14 w-full" key={i} />)}
          {!loading &&
            timeSlots.map((slot: Slot) => {
              return <SchedulerTimeSlot key={slot.start} timeSlot={slot} />;
            })}
        </div>
      </div>
    </>
  );
}

const abbrs: Record<string, string> = {
  EST: 'Eastern Standard Time',
  EDT: 'Eastern Daylight Time',
  CST: 'Central Standard Time',
  CDT: 'Central Daylight Time',
  MST: 'Mountain Standard Time',
  MDT: 'Mountain Daylight Time',
  PST: 'Pacific Standard Time',
  PDT: 'Pacific Daylight Time',
};

function fullAbbr(abbr: string): string {
  return abbrs[abbr] || abbr;
}
