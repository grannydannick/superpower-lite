import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input/input';

interface UnitNumericInputProps {
  /** Unit label shown inside the input (e.g. "ft", "kg") */
  unit: string;
  /** Controlled numeric value — `undefined` means "no value yet" */
  value: number | undefined;
  /** Fallback shown when value is undefined and the user clears the field */
  fallback: number;
  min: number;
  max: number;
  step?: number | 'any';
  placeholder?: string;
  /** Allow decimal entry (e.g. for kg). Defaults to false. */
  allowDecimal?: boolean;
  /** Called with the parsed number whenever the user types a valid value */
  onChange: (n: number) => void;
  /** Extra className forwarded to the outer wrapper div */
  className?: string;
}

export function UnitNumericInput({
  unit,
  value,
  fallback,
  min,
  max,
  step,
  placeholder,
  allowDecimal = false,
  onChange,
  className,
}: UnitNumericInputProps) {
  const [text, setText] = useState(value?.toString() ?? '');
  const focusedRef = useRef(false);

  useEffect(() => {
    if (focusedRef.current) return;
    setText(value?.toString() ?? '');
  }, [value]);

  const parse = allowDecimal ? parseFloat : (v: string) => parseInt(v, 10);
  const resolvedStep = step ?? (allowDecimal ? 'any' : 1);

  return (
    <div className={className ?? 'relative'}>
      <Input
        type="number"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        step={resolvedStep}
        min={min}
        max={max}
        value={text}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onChange={(e) => {
          const val = e.target.value;
          setText(val);
          const n = parse(val);
          if (!isNaN(n)) {
            onChange(n);
          }
        }}
        onBlur={() => {
          focusedRef.current = false;
          if (text === '') {
            const resolved = value ?? fallback;
            setText(String(resolved));
            onChange(resolved);
            return;
          }
          const n = parse(text);
          if (isNaN(n)) return;
          const clamped = Math.min(max, Math.max(min, n));
          if (clamped !== n) {
            setText(String(clamped));
          }
          onChange(clamped);
        }}
        placeholder={placeholder}
        className="pr-12"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
