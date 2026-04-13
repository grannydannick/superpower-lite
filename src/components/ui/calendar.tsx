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
        month: 'relative space-y-4 w-full',
        month_caption: 'flex justify-center items-center h-7 relative',
        caption_label:
          'text-sm font-medium relative z-[1] inline-flex items-center whitespace-nowrap',
        dropdowns: 'relative inline-flex items-center gap-2',
        dropdown:
          'absolute z-[2] opacity-0 appearance-none inset-0 cursor-pointer',
        nav: 'absolute top-0 flex items-center w-full justify-between z-[1] pointer-events-none',
        button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'pointer-events-auto h-7 w-7 bg-transparent p-1 hover:opacity-100',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'pointer-events-auto h-7 w-7 bg-transparent p-1 hover:opacity-100',
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex justify-between',
        weekday:
          'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'h-9 w-full aspect-square text-center text-sm p-0 relative justify-center items-center flex after:transition-all after:opacity-0 after:duration-50 after:z-10 after:pointer-events-none after:absolute after:w-9 after:h-9 after:rounded-full after:hover:ring-2 after:ring-1 after:hover:ring-vermillion-300 after:hover:opacity-100 active:after:ring-1 active:after:ring-offset-0 after:active:duration-0 after:active:ring-vermillion-900',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'duration-50 z-10 h-12 w-full p-0 font-normal transition-transform active:duration-0',
        ),
        range_end: 'range_end',
        selected:
          'after:!ring-vermillion-900 after:rounded-full after:z-20  after:opacity-100 after:active:!duration-50 [&_button]:!text-black ',
        today:
          'text-accent-foreground before:bg-accent before:absolute before:inset-y-0 before:w-9 before:rounded-full',
        outside: 'text-muted-foreground opacity-50',
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
