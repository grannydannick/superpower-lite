import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment-timezone';
import { useState } from 'react';
import { useLocation } from 'react-router';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1, H4 } from '@/components/ui/typography';

import { DEFAULT_DAYS_RANGE } from '../const';

import { RangeSelectButton } from './range-select-button';

interface SchedulerHeadingProps {
  startRange?: moment.Moment;
  tz: string;
  loading: boolean;
  onRangeChange: (newRange: moment.Moment) => void;
  onSelectionClear: () => void;
}

export const SchedulerHeading = ({
  startRange,
  tz,
  loading,
  onRangeChange,
  onSelectionClear,
}: SchedulerHeadingProps) => {
  const { pathname } = useLocation();

  const currentWeekStart = moment().tz(tz).startOf('isoWeek');
  const isAtInitialWeek = startRange
    ? startRange.clone().startOf('isoWeek').isSameOrBefore(currentWeekStart)
    : true;

  const handlePrev = () => {
    if (!startRange || isAtInitialWeek) return;

    const today = moment().tz(tz).startOf('day');
    const target = startRange
      .clone()
      .startOf('isoWeek')
      .subtract(DEFAULT_DAYS_RANGE, 'days')
      .tz(tz);

    // don't go before today
    const finalTarget = target.isBefore(today) ? today : target;

    onRangeChange(finalTarget);
    onSelectionClear();
  };

  const handleNext = () => {
    if (!startRange) return;

    const target = startRange
      .clone()
      .startOf('isoWeek')
      .add(DEFAULT_DAYS_RANGE, 'days')
      .tz(tz);

    onRangeChange(target);
    onSelectionClear();
  };

  const [open, setOpen] = useState(false);

  // tomorrow is the earliest selectable date
  const tomorrow = moment().tz(tz).add(1, 'day').startOf('day').toDate();

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;

    const selected = moment(date).tz(tz);
    onRangeChange(selected);
    onSelectionClear();
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {loading ? (
        <TextShimmer
          className="text-sm [--base-color:theme(colors.zinc.600)] [--base-gradient-color:theme(colors.zinc.200)] sm:text-base"
          duration={1.2}
        >
          Hang tight, it might take a little time...
        </TextShimmer>
      ) : // Render the calendar everywhere besides the onboarding
      !pathname.includes('/onboarding') ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="group flex items-center gap-1 p-0"
            >
              <H4>
                {startRange?.tz(tz).format('MMMM')}{' '}
                <span className="text-secondary">
                  {startRange?.tz(tz).format('YYYY')}
                </span>
              </H4>
              <ChevronDown
                className="text-zinc-400 transition-all duration-200 group-data-[state=open]:-rotate-180"
                size={20}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto rounded-2xl p-2" align="start">
            <Calendar
              mode="single"
              showOutsideDays
              captionLayout="dropdown"
              disabled={{ before: tomorrow }}
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <div className="px-2 py-1">
          <Body1 className="text-sm text-primary sm:text-base">
            {startRange?.tz(tz).format('MMMM')}{' '}
            <span className="text-secondary">
              {startRange?.tz(tz).format('YYYY')}
            </span>
          </Body1>
        </div>
      )}
      <div className="flex items-center">
        <div className="flex flex-row items-center">
          {loading ? <Spinner variant="primary" size="xs" /> : null}
          <RangeSelectButton
            icon={<ChevronLeft className="size-5 text-zinc-400" />}
            disabled={loading || isAtInitialWeek}
            onClick={handlePrev}
          />
          <RangeSelectButton
            icon={<ChevronRight className="size-5 text-zinc-400" />}
            disabled={loading}
            onClick={handleNext}
          />
        </div>
      </div>
    </div>
  );
};
