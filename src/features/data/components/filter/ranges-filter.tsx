import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { Body1 } from '@/components/ui/typography';

import { STATUS_TO_COLOR } from '../../../../const/status-to-color';
import { RANGES } from '../../const/ranges';
import { useDataFilterStore } from '../../stores/data-filter-store';
import { StatusFilterOptionType } from '../../types/filters';

export const RangesFilter = () => {
  const { selectedRange, updateRange } = useDataFilterStore();
  const color =
    STATUS_TO_COLOR[
      selectedRange.toLowerCase() as keyof typeof STATUS_TO_COLOR
    ] || 'rgba(161, 161, 170, 1)';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 px-4 text-zinc-500">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <Body1 className="text-neutral-500">
            {RANGES.find((range) => range.id === selectedRange)?.name}
          </Body1>
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {RANGES.map((range) => (
          <DropdownMenuItem
            key={range.id}
            className="flex items-center gap-3"
            onClick={() => updateRange(range.id as StatusFilterOptionType)}
          >
            <div
              className="size-2 rounded-full"
              style={{
                backgroundColor:
                  range.id === 'all'
                    ? 'rgba(161, 161, 170, 1)'
                    : STATUS_TO_COLOR[
                        range.id.toLowerCase() as keyof typeof STATUS_TO_COLOR
                      ],
              }}
            />
            <Body1>{range.name}</Body1>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
