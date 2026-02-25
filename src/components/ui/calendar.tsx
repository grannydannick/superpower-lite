import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,

  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row gap-4 sm:gap-0',
        month: 'relative space-y-4',
        month_caption: 'flex justify-center items-center h-7 relative',
        caption_label:
          'text-sm font-medium relative z-[1] inline-flex items-center whitespace-nowrap',
        dropdowns: 'relative inline-flex items-center gap-2',
        dropdown:
          'absolute z-[2] opacity-0 appearance-none inset-0 cursor-pointer',
        nav: 'absolute top-0 flex items-center w-full justify-between z-[1] pointer-events-none',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'pointer-events-auto h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'pointer-events-auto h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].range_end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        range_end: 'range_end',
        selected: 'border border-vermillion-900',
        today: 'bg-accent text-accent-foreground',
        outside:
          'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, size = 24 }) => {
          if (orientation === 'left') {
            return <ChevronLeft className={className} size={size} />;
          }
          if (orientation === 'right') {
            return <ChevronRight className={className} size={size} />;
          }
          if (orientation === 'up') {
            return (
              <ChevronDown
                className={cn('rotate-180', className)}
                size={size}
              />
            );
          }

          return <ChevronDown className={className} size={size} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
