import { TZDateMini, type TZDate } from '@date-fns/tz';
import { useRouterState } from '@tanstack/react-router';
import {
  addDays,
  format,
  isAfter,
  isBefore,
  startOfDay,
  startOfISOWeek,
  subDays,
} from 'date-fns';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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
import { useNowMs } from '@/hooks/use-now-ms';

import { DEFAULT_DAYS_RANGE } from '../const';

import { RangeSelectButton } from './range-select-button';

interface SchedulerHeadingProps {
  startRange?: TZDate;
  tz: string;
  loading: boolean;
  onRangeChange: (newRange: TZDate) => void;
  onSelectionClear: () => void;
}

export const SchedulerHeading = ({
  startRange,
  tz,
  loading,
  onRangeChange,
  onSelectionClear,
}: SchedulerHeadingProps) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const startRangeInTz =
    startRange?.timeZone === tz
      ? startRange
      : startRange
        ? new TZDateMini(startRange.getTime(), tz)
        : undefined;

  const nowMs = useNowMs();
  const currentWeekStart = startOfISOWeek(new TZDateMini(nowMs, tz));
  const isAtInitialWeek =
    startRangeInTz == null
      ? true
      : !isAfter(startOfISOWeek(startRangeInTz), currentWeekStart);

  const handlePrev = () => {
    if (startRangeInTz == null || isAtInitialWeek) return;

    const today = startOfDay(new TZDateMini(nowMs, tz));
    const target = subDays(startOfISOWeek(startRangeInTz), DEFAULT_DAYS_RANGE);

    // don't go before today
    const finalTarget = isBefore(target, today) ? today : target;

    onRangeChange(new TZDateMini(finalTarget.getTime(), tz));
    onSelectionClear();
  };

  const handleNext = () => {
    if (startRangeInTz == null) return;

    const target = addDays(startOfISOWeek(startRangeInTz), DEFAULT_DAYS_RANGE);

    onRangeChange(new TZDateMini(target.getTime(), tz));
    onSelectionClear();
  };

  const [open, setOpen] = useState(false);

  // tomorrow is the earliest selectable date
  const tomorrow = startOfDay(addDays(new TZDateMini(nowMs, tz), 1));

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date == null) return;

    const selected = new TZDateMini(date.getTime(), tz);
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
                {startRangeInTz != null ? format(startRangeInTz, 'MMMM') : null}{' '}
                <span className="text-secondary">
                  {startRangeInTz != null
                    ? format(startRangeInTz, 'yyyy')
                    : null}
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
              disabled={{ before: tomorrow }}
              timeZone={tz}
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <div className="px-2 py-1">
          <Body1 className="text-sm text-primary sm:text-base">
            {startRangeInTz != null ? format(startRangeInTz, 'MMMM') : null}{' '}
            <span className="text-secondary">
              {startRangeInTz != null ? format(startRangeInTz, 'yyyy') : null}
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
