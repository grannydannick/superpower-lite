import { Search, X } from 'lucide-react';
import { useRef, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHotkey } from '@/hooks/use-hotkey';
import { cn } from '@/lib/utils';

export const DataSearch = ({
  className,
  onChange,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = rest.value !== undefined;
  const [uncontrolledValueLength, setUncontrolledValueLength] = useState(() => {
    const defaultValue = rest.defaultValue;

    if (defaultValue === undefined) return 0;
    if (typeof defaultValue === 'string') return defaultValue.length;
    if (typeof defaultValue === 'number') return String(defaultValue).length;
    if (Array.isArray(defaultValue)) return defaultValue.join('').length;

    return 0;
  });

  let controlledValueLength = 0;
  if (isControlled) {
    const value = rest.value;

    if (typeof value === 'string') controlledValueLength = value.length;
    else if (typeof value === 'number')
      controlledValueLength = String(value).length;
    else if (Array.isArray(value))
      controlledValueLength = value.join('').length;
  }

  const isEmpty = isControlled
    ? controlledValueLength === 0
    : uncontrolledValueLength === 0;

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useHotkey({
    key: 'k',
    ctrlOrMeta: true,
    preventDefault: true,
    handler: () => focusInput(),
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setUncontrolledValueLength(e.currentTarget.value.length);
      }
      onChange?.(e);
    },
    [isControlled, onChange],
  );

  const handleClear = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    // Use the native setter to bypass React's internal value tracking,
    // otherwise React won't fire onChange for controlled inputs.
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    setter?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));

    input.focus();
  }, []);

  return (
    <div
      className={cn(
        'relative flex h-10 flex-1 items-center gap-2 md:h-12',
        className,
      )}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-10 -mt-px size-4 -translate-y-1/2 text-zinc-400"
        strokeWidth={2.5}
      />
      <Input
        {...rest}
        onChange={handleChange}
        ref={inputRef}
        placeholder="Search…"
        className="absolute inset-0 w-[calc(100%-1.5rem)] border-none pl-9 shadow-none outline-none focus-visible:bg-transparent focus-visible:ring-0"
      />
      <Button
        type="button"
        onClick={handleClear}
        variant="ghost"
        className={cn(
          'absolute right-0 top-1/2 aspect-square size-5 -translate-y-1/2 transition-all duration-200',
          isEmpty && 'pointer-events-none opacity-0',
        )}
      >
        <X size={16} />
      </Button>
    </div>
  );
};
