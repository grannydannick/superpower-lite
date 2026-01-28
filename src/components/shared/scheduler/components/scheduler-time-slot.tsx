import moment from 'moment-timezone';

import { Body2 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Slot } from '@/types/api';

interface SchedulerTimeSlotProps {
  timeSlot: Slot;
  selectedSlot?: Slot | null;
  tz: string;
  onSlotSelect: (slot: Slot) => void;
}

export const SchedulerTimeSlot = ({
  timeSlot,
  selectedSlot,
  tz,
  onSlotSelect,
}: SchedulerTimeSlotProps) => {
  const selected = timeSlot.start === selectedSlot?.start;

  return (
    <div
      className={cn(
        'flex rounded-xl cursor-pointer ease-in-out duration-200 p-3 text-nowrap border bg-white',
        selected
          ? 'border-vermillion-900 shadow-lg shadow-vermillion-900/10'
          : '',
      )}
      key={timeSlot.start}
      onClick={() => onSlotSelect(timeSlot)}
      role="presentation"
    >
      <Body2>{timeRangeText(timeSlot, tz)}</Body2>
    </div>
  );
};

const timeRangeText = (slot: Slot, tz: string): string => {
  return `${moment(slot.start).tz(tz).format('h:mma')} — ${moment(slot.end).tz(tz).format('h:mma')}`;
};
