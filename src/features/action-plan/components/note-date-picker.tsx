import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { cn } from '@/lib/utils';

interface ClinicianNoteDatePickerInterface {
  date: DateRange;
  goalIndex: number;
}

export function ClinicianNoteDatePicker({
  date,
  goalIndex,
}: ClinicianNoteDatePickerInterface): JSX.Element {
  const [curDate, setCurDate] = useState<DateRange | undefined>(date);
  const { isAdmin, changeGoalDate } = usePlan((s) => s);

  useEffect(() => {
    if (curDate?.from && curDate.to) {
      changeGoalDate(curDate, goalIndex);
    }
  }, [curDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          disabled={!isAdmin}
          className={cn(
            'justify-start text-left font-normal p-2 border-0 w-full disabled:opacity-1 shadow-none',
            !curDate && 'text-muted-foreground',
          )}
        >
          {curDate?.from ? (
            curDate?.to ? (
              <div className="flex flex-row items-center space-x-2">
                <span className="text-[#A1A1AA]">
                  {format(curDate?.from, 'LLL dd, y')}
                </span>
                <ArrowRight className="size-4" />
                <span className="text-[#A1A1AA]">
                  {format(curDate?.to, 'LLL dd, y')}
                </span>
              </div>
            ) : (
              <span className="text-[#A1A1AA]">
                {format(curDate?.from, 'LLL dd, y')}
              </span>
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={curDate?.from}
          disabled={!isAdmin}
          selected={curDate}
          onSelect={setCurDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
