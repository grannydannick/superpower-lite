import { ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment';
import 'moment-timezone';
import { toast } from 'sonner';

import { Spinner } from '@/components/ui/spinner';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1 } from '@/components/ui/typography';

import { useScheduler } from '../stores/scheduler';

import { RangeSelectButton } from './range-select-button';

export function SchedulerHeading(): JSX.Element {
  const {
    updateSelectedDay,
    tz,
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

    // Get the current date in the specified timezone, set to start of the day
    const currentDate = moment().tz(tz);

    // Compare the newStartRange with the current date
    if (newStartRange.isBefore(currentDate)) {
      toast.warning("Slots can't be in the past.");
      //  Automatically adjust the newStartRange to the current date
      updateStartRange(currentDate);
    } else {
      updateStartRange(newStartRange);
    }
    updateSelectedDay(undefined);
    updateSelectedSlot(undefined);

    // additional callback if native button is hidden
    onSlotUpdate && !showCreateBtn && onSlotUpdate(null, tz);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {loading ? (
        <TextShimmer
          className="text-sm [--base-color:theme(colors.zinc.600)] [--base-gradient-color:theme(colors.zinc.200)] sm:text-base"
          duration={1.2}
        >
          Hang tight, it might take a little time to fetch the locations.
        </TextShimmer>
      ) : (
        <Body1 className="text-sm text-zinc-600 sm:text-base">
          {startRange?.tz(tz).format('MMMM')}
        </Body1>
      )}
      <div className="flex items-center">
        <div className="flex flex-row items-center">
          {loading ? <Spinner variant="primary" size="xs" /> : null}

          <RangeSelectButton
            icon={<ChevronLeft className="size-4" />}
            disabled={loading}
            onClick={() => {
              numDays && handleClick(-numDays);
            }}
          />
          <RangeSelectButton
            icon={<ChevronRight className="size-4" />}
            disabled={loading}
            onClick={() => {
              numDays && handleClick(numDays);
            }}
          />
        </div>
      </div>
    </div>
  );
}
