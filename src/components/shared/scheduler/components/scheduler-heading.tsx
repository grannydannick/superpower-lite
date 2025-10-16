import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment';
import 'moment-timezone';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
    slots,
    selectedDay,
  } = useScheduler((s) => s);
  const { pathname } = useLocation();

  // Store the initial startRange when the component first loads as we do not want to show dates before this
  const initialStartRangeRef = useRef<moment.Moment | null>(null);
  useEffect(() => {
    if (!initialStartRangeRef.current && slots && slots.length > 0) {
      // Find the earliest slot date (in scheduler timezone)
      const earliestSlot = slots.reduce((min, slot) => {
        const m = moment(slot.start).tz(tz);
        return m.isBefore(min) ? m : min;
      }, moment(slots[0].start).tz(tz));
      initialStartRangeRef.current = earliestSlot.clone();
    }
  }, [slots, tz]);

  // Calculate the previous range end if the user clicks the left chevron to know when to disable it
  const prevRangeEnd = startRange
    ? startRange.clone().subtract(1, 'days')
    : null;

  const initialStartRange = initialStartRangeRef.current;

  const handleClick = async (numDays: number) => {
    if (!startRange) return;

    const newStartRange = startRange.clone().add(numDays, 'days').tz(tz);

    const currentDate = moment().tz(tz);

    if (newStartRange.isBefore(currentDate)) {
      //  automatically adjust the newStartRange to the current date
      updateStartRange(currentDate);
    } else {
      updateStartRange(newStartRange);
    }
    updateSelectedDay(undefined);
    updateSelectedSlot(undefined);

    // additional callback if native button is hidden
    onSlotUpdate && !showCreateBtn && onSlotUpdate(null, tz);
  };

  const [open, setOpen] = useState(false);

  const handleDaySelect = (date?: Date) => {
    if (!date) return;

    const picked = moment
      .tz(
        {
          year: date.getFullYear(),
          month: date.getMonth(),
          date: date.getDate(),
        },
        tz,
      )
      .startOf('day');

    const weekStart = picked.clone().startOf('isoWeek');

    const minStart = initialStartRangeRef.current
      ? initialStartRangeRef.current.clone()
      : moment().tz(tz);

    const newStart = weekStart.isBefore(minStart) ? minStart : weekStart;

    updateStartRange(newStart);
    updateSelectedDay(picked);
    updateSelectedSlot(undefined);

    onSlotUpdate && !showCreateBtn && onSlotUpdate(null, tz);

    setOpen(false);
  };

  const defaultMonthDate = startRange
    ? new Date(startRange.year(), startRange.month(), startRange.date())
    : undefined;

  const selectedDate = selectedDay
    ? new Date(selectedDay.year(), selectedDay.month(), selectedDay.date())
    : startRange
      ? new Date(startRange.year(), startRange.month(), startRange.date())
      : undefined;

  const getCalendarMinDate = useCallback(() => {
    const min = (
      initialStartRangeRef.current
        ? initialStartRangeRef.current.clone()
        : moment().tz(tz)
    ).startOf('day');
    return new Date(min.year(), min.month(), min.date());
  }, [tz]);

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
              className="group flex items-center gap-2 px-2 py-1 transition-colors duration-150 hover:bg-zinc-100"
            >
              <Body1 className="text-sm text-primary sm:text-base">
                {startRange?.tz(tz).format('MMMM')}{' '}
                <span className="text-secondary">
                  {startRange?.tz(tz).format('YYYY')}
                </span>
              </Body1>
              <ChevronDown
                className="text-zinc-400 transition-all duration-200 group-data-[state=open]:-rotate-180"
                size={16}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto rounded-2xl p-2" align="start">
            <Calendar
              mode="single"
              showOutsideDays
              captionLayout="dropdown"
              defaultMonth={defaultMonthDate}
              selected={selectedDate}
              onSelect={handleDaySelect}
              // Disable picking dates before the earliest available (or today as a fallback)
              disabled={{ before: getCalendarMinDate() }}
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
            icon={<ChevronLeft className="size-4" />}
            disabled={
              loading ||
              !prevRangeEnd ||
              prevRangeEnd.isBefore(initialStartRange, 'day')
            }
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
