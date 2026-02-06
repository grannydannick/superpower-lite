import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

import { Input } from './input';

const timePickerSeparatorBase = 'text-xs text-zinc-400';

type DateFormat = 'months' | 'days' | 'years';
type TimeFormat = 'hours' | 'minutes' | 'seconds' | 'am/pm';
type DateTimeArray<T> = T[];
type DateTimeFormatDefaults = [
  DateTimeArray<DateFormat>,
  DateTimeArray<TimeFormat>?,
];

const DEFAULTS = [['months', 'days', 'years'], []] as DateTimeFormatDefaults;

type InputPlaceholders = Record<DateFormat, string>;
const INPUT_PLACEHOLDERS: InputPlaceholders = {
  months: 'MM',
  days: 'DD',
  years: 'YYYY',
};

const TEST_IDS: Record<DateFormat, string> = {
  months: 'months',
  days: 'days',
  years: 'years',
};

const MAX_LENGTHS: Record<DateFormat, number> = {
  months: 2,
  days: 2,
  years: 4,
};

const DatetimeGrid = forwardRef<
  HTMLDivElement,
  {
    format: DateTimeFormatDefaults;
    className?: string;
    values: Record<DateFormat, string>;
    onChange: (type: DateFormat, value: string) => void;
    placeholders: InputPlaceholders;
    variant?: 'individual' | 'error' | 'default';
  }
>(
  (
    {
      format,
      className,
      values,
      onChange,
      placeholders,
      variant = 'individual',
    },
    ref,
  ) => {
    const monthRef = useRef<HTMLInputElement>(null);
    const dayRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    // Track cursor position for proper restoration after filtering
    const cursorPositionRef = useRef<{
      type: DateFormat;
      position: number;
    } | null>(null);

    /**
     * Filter value to only allow digits and apply constraints
     */
    const filterValue = useCallback(
      (type: DateFormat, rawValue: string): string => {
        // Filter to digits only
        let value = rawValue.replace(/\D/g, '');

        // Apply max length
        if (value.length > MAX_LENGTHS[type]) {
          value = value.slice(0, MAX_LENGTHS[type]);
        }

        // Apply range constraints
        if (type === 'months') {
          const num = parseInt(value, 10);
          if (!isNaN(num) && num > 12) {
            value = '12';
          }
        }
        if (type === 'days') {
          const num = parseInt(value, 10);
          if (!isNaN(num) && num > 31) {
            value = '31';
          }
        }

        return value;
      },
      [],
    );

    /**
     * Handle input changes with proper cursor management for mobile
     */
    const handleChange = useCallback(
      (type: DateFormat, e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const rawValue = input.value;
        const cursorPosition = input.selectionStart ?? 0;

        // Filter the value
        const filteredValue = filterValue(type, rawValue);

        // Calculate new cursor position based on valid characters before cursor
        const beforeCursor = rawValue.slice(0, cursorPosition);
        const validCharsBeforeCursor = (beforeCursor.match(/\d/g) || []).length;
        const newCursorPosition = Math.min(
          validCharsBeforeCursor,
          filteredValue.length,
        );

        // Store cursor position for restoration
        cursorPositionRef.current = { type, position: newCursorPosition };

        // Update the input value directly to avoid mobile input issues
        input.value = filteredValue;

        // Notify parent of the change
        onChange(type, filteredValue);

        // Auto-advance to next field when current field is complete
        if (filteredValue.length === MAX_LENGTHS[type]) {
          // Use setTimeout to ensure state has settled
          setTimeout(() => {
            switch (type) {
              case 'months':
                dayRef.current?.focus();
                break;
              case 'days':
                yearRef.current?.focus();
                break;
              default:
                break;
            }
          }, 0);
        }
      },
      [filterValue, onChange],
    );

    /**
     * Restore cursor position after render to fix mobile input issues
     */
    useLayoutEffect(() => {
      if (cursorPositionRef.current) {
        const { type, position } = cursorPositionRef.current;
        const inputRef =
          type === 'months' ? monthRef : type === 'days' ? dayRef : yearRef;

        if (inputRef.current && document.activeElement === inputRef.current) {
          inputRef.current.setSelectionRange(position, position);
        }
        cursorPositionRef.current = null;
      }
    });

    return (
      <div
        className={cn(
          'flex items-center px-6 py-4 border rounded-xl gap-1 selection:bg-transparent selection:text-foreground',
          variant === 'error'
            ? 'border-pink-700 bg-pink-50 focus-within:ring-1 focus-within:ring-pink-700 transition-none duration-0'
            : 'border-input bg-white shadow-sm focus-within:ring-2 focus-within:ring-ring  transition-[box-shadow] duration-150',
          className,
        )}
        ref={ref}
      >
        {(format[0] || []).map((unit, j) => (
          <React.Fragment key={unit}>
            <Input
              ref={
                unit === 'months'
                  ? monthRef
                  : unit === 'days'
                    ? dayRef
                    : yearRef
              }
              className={cn(
                'p-0 inline h-fit shadow-none border-none outline-none select-none content-box focus-visible:bg-zinc-100 rounded-sm w-full text-center focus-visible:ring-0 focus-visible:outline-none min-w-8',
                { 'min-w-12': unit === 'years' },
                variant === 'error' &&
                  'bg-transparent focus-visible:!bg-transparent placeholder:text-pink-700 transition-none duration-0',
              )}
              inputMode="numeric"
              value={values[unit]}
              onChange={(e) => handleChange(unit, e)}
              placeholder={placeholders[unit]}
              data-testid={TEST_IDS[unit]}
              maxLength={MAX_LENGTHS[unit]}
            />
            {j < (format[0]?.length || 0) - 1 && (
              <span className={timePickerSeparatorBase}>/</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  },
);
DatetimeGrid.displayName = 'DatetimeGrid';

interface DateTimeInput {
  value?: Date;
  format?: DateTimeFormatDefaults;
  placeholders?: InputPlaceholders;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  variant?: 'individual' | 'error' | 'default';
}

export const DatetimePicker = forwardRef<HTMLDivElement, DateTimeInput>(
  (
    {
      value = undefined,
      format = DEFAULTS,
      placeholders,
      onChange,
      className,
      variant = 'individual',
    },
    ref,
  ) => {
    const [month, setMonth] = useState<string>('');
    const [day, setDay] = useState<string>('');
    const [year, setYear] = useState<string>('');

    useEffect(() => {
      if (value && !isNaN(value.getTime())) {
        setMonth(String(value.getMonth() + 1));
        setDay(String(value.getDate()));
        setYear(String(value.getFullYear()));
      }
    }, []);

    const handleChange = useCallback(
      (type: DateFormat, newValue: string) => {
        let updatedMonth = month;
        let updatedDay = day;
        let updatedYear = year;
        switch (type) {
          case 'months':
            setMonth(newValue);
            updatedMonth = newValue;
            break;
          case 'days':
            setDay(newValue);
            updatedDay = newValue;
            break;
          case 'years':
            setYear(newValue);
            updatedYear = newValue;
            break;
        }
        // Only update parent's value when all fields are nonempty.
        if (updatedMonth === '' || updatedDay === '' || updatedYear === '') {
          return;
        }
        const finalMonth = parseInt(updatedMonth, 10);
        const finalDay = parseInt(updatedDay, 10);
        const finalYear = parseInt(updatedYear, 10);
        if (
          !isNaN(finalMonth) &&
          !isNaN(finalDay) &&
          !isNaN(finalYear) &&
          finalMonth >= 1 &&
          finalMonth <= 12 &&
          finalDay >= 1 &&
          finalDay <= 31 &&
          finalYear >= 1900
        ) {
          const newDate = new Date(finalYear, finalMonth - 1, finalDay);
          onChange?.(newDate);
        }
      },
      [month, day, year, onChange],
    );

    const values: Record<DateFormat, string> = {
      months: month,
      days: day,
      years: year,
    };

    return (
      <DatetimeGrid
        format={format}
        className={className}
        variant={variant}
        values={values}
        onChange={(type, value) => {
          switch (type) {
            case 'months':
              setMonth(value);
              break;
            case 'days':
              setDay(value);
              break;
            case 'years':
              setYear(value);
              break;
          }
          handleChange(type, value);
        }}
        placeholders={placeholders ?? INPUT_PLACEHOLDERS}
        ref={ref}
      />
    );
  },
);
DatetimePicker.displayName = 'DatetimePicker';
