import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { AnimatedCheckbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export const LabeledCheckbox = ({
  id,
  checked,
  onCheckedChange,
  label,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label: string | ReactNode;
}) => {
  return (
    <div className="group flex space-x-3">
      <div
        className={cn(
          'flex aspect-square size-5 rounded-md border transition-all duration-150',
          checked
            ? 'border-zinc-900 bg-black'
            : 'border-zinc-200 group-hover:border-zinc-300 group-hover:bg-zinc-100',
        )}
      >
        <AnimatedCheckbox
          id={id}
          className="data-[state=checked]:text-white"
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
      <Label
        htmlFor={id}
        className="cursor-pointer text-sm leading-5 text-zinc-500"
      >
        {label}
      </Label>
    </div>
  );
};
