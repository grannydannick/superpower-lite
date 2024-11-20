import { Command as CommandPrimitive } from 'cmdk';
import { MapPin } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type AddressCommandInputColor = 'zinc' | 'white';
const AddressCommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    color?: AddressCommandInputColor;
  }
>(({ className, value, color, ...props }, ref) => (
  <div
    className={cn(
      'flex items-center rounded-xl border p-4 text-[16px] font-normal placeholder:opacity-50',
      color === 'zinc'
        ? 'text-zinc-600 border-zinc-200 caret-zinc-600 bg-white'
        : 'text-white caret-white border-white/20 bg-white/5 focus:border-white',
    )}
  >
    <MapPin
      className={cn(
        'mr-2 size-4 shrink-0',
        color === 'zinc' ? 'text-zinc-600' : 'text-white',
      )}
    />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex w-full rounded-md bg-transparent text-base outline-none placeholder:text-opacity-50 disabled:cursor-not-allowed disabled:opacity-50',
        color === 'zinc'
          ? 'placeholder:text-zinc-400'
          : 'placeholder:text-white',
        className,
      )}
      value={value}
      {...props}
    />
  </div>
));

AddressCommandInput.displayName = CommandPrimitive.Input.displayName;

export { AddressCommandInput };
