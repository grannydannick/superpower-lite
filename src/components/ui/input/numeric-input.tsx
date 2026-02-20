import * as React from 'react';

import { cn } from '@/lib/utils';

import { Input, InputProps } from './input';

export interface NumericInputProps extends Omit<
  InputProps,
  'type' | 'inputMode' | 'onChange'
> {
  /**
   * Maximum number of digits allowed
   */
  maxDigits?: number;
  /**
   * Whether to allow decimal points
   */
  allowDecimal?: boolean;
  /**
   * Whether to allow negative numbers
   */
  allowNegative?: boolean;
  /**
   * Called when the numeric value changes
   */
  onChange?: (value: string) => void;
  /**
   * Called with the raw event for form library compatibility
   */
  onValueChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * A mobile-friendly numeric input component that properly handles
 * digit-only input without blocking typing or preventing progression
 * through checkout flows.
 *
 * Key features:
 * - Uses 'text' type with 'numeric' inputMode for best mobile keyboard support
 * - Filters non-numeric characters without blocking input
 * - Maintains cursor position when filtering
 * - Compatible with React Hook Form and other form libraries
 * - Prevents arrow key number incrementing
 */
const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      className,
      maxDigits,
      allowDecimal = false,
      allowNegative = false,
      onChange,
      onValueChange,
      value,
      defaultValue,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    // Internal ref for cursor management
    const inputRef = React.useRef<HTMLInputElement>(null);
    const cursorPositionRef = React.useRef<number | null>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    /**
     * Filters the input value to only allow valid numeric characters
     */
    const filterValue = React.useCallback(
      (inputValue: string): string => {
        if (!inputValue) return '';

        // Build regex pattern based on options
        let pattern = '\\d';
        if (allowDecimal) {
          pattern = '[\\d.]';
        }
        if (allowNegative) {
          pattern = allowDecimal ? '[\\d.\\-]' : '[\\d\\-]';
        }

        const regex = new RegExp(pattern, 'g');
        let filtered = (inputValue.match(regex) || []).join('');

        // Handle negative sign - only allow at start
        if (allowNegative && filtered.includes('-')) {
          const hasLeadingMinus = filtered.startsWith('-');
          filtered = filtered.replace(/-/g, '');
          if (hasLeadingMinus) {
            filtered = '-' + filtered;
          }
        }

        // Handle decimal point - only allow one
        if (allowDecimal && filtered.includes('.')) {
          const parts = filtered.split('.');
          filtered = parts[0] + '.' + parts.slice(1).join('');
        }

        // Apply max digits limit (excluding decimal point and negative sign)
        if (maxDigits !== undefined) {
          const digitsOnly = filtered.replace(/[^0-9]/g, '');
          if (digitsOnly.length > maxDigits) {
            // Reconstruct with limited digits
            let digitCount = 0;
            let result = '';
            for (const char of filtered) {
              if (/\d/.test(char)) {
                if (digitCount < maxDigits) {
                  result += char;
                  digitCount++;
                }
              } else {
                result += char;
              }
            }
            filtered = result;
          }
        }

        return filtered;
      },
      [allowDecimal, allowNegative, maxDigits],
    );

    /**
     * Handle input changes with proper cursor management
     */
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const originalValue = input.value;
        const cursorPosition = input.selectionStart ?? 0;

        // Filter the value
        const filteredValue = filterValue(originalValue);

        // Calculate new cursor position
        // Count how many valid characters are before the cursor in the original
        let validCharsBeforeCursor = 0;
        const beforeCursor = originalValue.slice(0, cursorPosition);
        for (const char of beforeCursor) {
          if (
            /\d/.test(char) ||
            (allowDecimal && char === '.') ||
            (allowNegative && char === '-')
          ) {
            validCharsBeforeCursor++;
          }
        }

        // Store the intended cursor position
        cursorPositionRef.current = Math.min(
          validCharsBeforeCursor,
          filteredValue.length,
        );

        // Update the input value directly to avoid React state timing issues
        input.value = filteredValue;

        // Create a synthetic event with the filtered value for form libraries
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: filteredValue,
          },
          currentTarget: {
            ...e.currentTarget,
            value: filteredValue,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        // Call the provided onChange handlers
        onChange?.(filteredValue);
        onValueChange?.(syntheticEvent);
      },
      [filterValue, onChange, onValueChange, allowDecimal, allowNegative],
    );

    /**
     * Restore cursor position after render
     */
    React.useLayoutEffect(() => {
      if (
        cursorPositionRef.current !== null &&
        inputRef.current &&
        document.activeElement === inputRef.current
      ) {
        const pos = cursorPositionRef.current;
        inputRef.current.setSelectionRange(pos, pos);
        cursorPositionRef.current = null;
      }
    });

    /**
     * Handle key down to prevent arrow key number changes
     */
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent arrow keys from changing the number
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
        }
        onKeyDown?.(e);
      },
      [onKeyDown],
    );

    // Build the pattern attribute for HTML5 validation hints
    const pattern = React.useMemo(() => {
      if (allowDecimal && allowNegative) {
        return '-?[0-9]*\\.?[0-9]*';
      }
      if (allowDecimal) {
        return '[0-9]*\\.?[0-9]*';
      }
      if (allowNegative) {
        return '-?[0-9]*';
      }
      return '[0-9]*';
    }, [allowDecimal, allowNegative]);

    return (
      <Input
        ref={inputRef}
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        pattern={pattern}
        autoComplete="off"
        className={cn(className)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
    );
  },
);

NumericInput.displayName = 'NumericInput';

export { NumericInput };
