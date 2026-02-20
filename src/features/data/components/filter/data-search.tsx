import { Search, X } from 'lucide-react';
import { useRef, useCallback } from 'react';

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
      onChange?.(e);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    input.value = '';

    // update parent via event
    const event = {
      target: input,
      currentTarget: input,
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleChange(event);

    // keep focus state
    input.focus();
  }, [handleChange]);

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
          inputRef.current?.value.length === 0 &&
            'pointer-events-none opacity-0',
        )}
      >
        <X size={16} />
      </Button>
    </div>
  );
};
