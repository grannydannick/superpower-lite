import moment from 'moment-timezone';

import { Body2, Body3, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Slot } from '@/types/api';

import { dayCount, isDisabledDaySlot } from '../utils';

interface SchedulerDaySlotProps {
  day: moment.Moment;
  selectedDay?: moment.Moment;
  slots: Slot[];
  tz: string;
  onDaySelect: (day: moment.Moment) => void;
}

export const SchedulerDaySlot = ({
  day,
  selectedDay,
  slots,
  tz,
  onDaySelect,
}: SchedulerDaySlotProps) => {
  const selected = selectedDay?.isSame(day, 'day') || false;
  const disabled = isDisabledDaySlot(day, slots);
  const numSlots = dayCount(day, slots);

  return (
    <div className="space-y-1.5">
      <Body2 className="pl-3">
        {moment(day).tz(tz).format('dddd').substring(0, 3)}
      </Body2>
      <div
        className={cn(
          'px-3 py-2 border rounded-xl w-full transition-all duration-200 border-zinc-200 bg-white cursor-pointer space-y-1',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          selected && !disabled
            ? 'border-vermillion-900 shadow-lg shadow-vermillion-900/10'
            : '',
        )}
        onClick={() => {
          if (isDisabledDaySlot(day, slots)) return;
          onDaySelect(day);
        }}
        role="presentation"
      >
        <H4>{moment(day).tz(tz).format('DD')}</H4>
        <Body3 className={'text-nowrap text-secondary'}>
          {numSlots && numSlots > 0 ? `${numSlots} slots` : 'Closed'}
        </Body3>
      </div>
    </div>
  );
};
