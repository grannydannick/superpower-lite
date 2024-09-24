import { Circle, ChevronDown } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBiomarkerFilterStore } from '@/features/action-plan/stores/biomarker-fiter-store';
import { STATUS_OPTIONS } from '@/features/biomarkers/const/toolbar-options';
import { cn } from '@/lib/utils';

interface StatusFilterProps {
  title?: React.ReactNode;
}

/*
 * NM & UZ Sept 22, 2024
 *
 * Marking this as TECH debt until we implement new approach for data page & tables that can be reusable
 *
 * Should reuse biomarkers/components/biomarker-data-table/biomarker-data-table.tsx
 * */
export function BiomarkerStatusFilter({
  title = 'Status',
}: StatusFilterProps): JSX.Element {
  const selectedStatuses = useBiomarkerFilterStore(
    (state) => state.selectedStatuses,
  );
  const setStatuses = useBiomarkerFilterStore((state) => state.setStatuses);
  const clearStatuses = useBiomarkerFilterStore((state) => state.clearStatuses);

  const allRangesStatusOption = STATUS_OPTIONS.find((o) => o.value === '');
  const selectedValues = new Set(selectedStatuses);

  // Updated function to select only one status at a time
  const selectStatus = (value: string) => {
    if (selectedValues.has(value)) {
      clearStatuses();
    } else {
      setStatuses([value]);
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'bg-white rounded-lg py-2 px-3 text-sm text-zinc-500 flex items-center gap-x-1.5 light',
              selectedValues.size === 0
                ? 'border-0'
                : `border-${STATUS_OPTIONS.find((o) => selectedValues.has(o.value))?.color}`,
            )}
          >
            <div
              className={cn(
                `h-4 w-4 rounded-full border border-${
                  STATUS_OPTIONS.find(
                    (o) =>
                      selectedValues.has(o.value) ||
                      (selectedValues.size === 0 &&
                        o.value === allRangesStatusOption?.value),
                  )?.color
                } flex items-center justify-center`,
              )}
            >
              <Circle
                className={cn(
                  `h-3 w-3 fill-${
                    STATUS_OPTIONS.find(
                      (o) =>
                        selectedValues.has(o.value) ||
                        (selectedValues.size === 0 &&
                          o.value === allRangesStatusOption?.value),
                    )?.color
                  }`,
                )}
                strokeWidth={0}
              />
            </div>
            <div className="hidden whitespace-nowrap sm:block">
              {selectedValues.size === 0
                ? title
                : STATUS_OPTIONS.find((o) => selectedValues.has(o.value))
                    ?.label}
            </div>
            <ChevronDown className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="rounded-xl border-0 bg-white p-4 text-sm shadow"
          align="end"
          side="bottom"
        >
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-row items-center justify-between">
              <div>Ranges</div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-sm text-gray-400 hover:bg-transparent"
                  onClick={clearStatuses}
                >
                  Restore default
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-y-1">
              {STATUS_OPTIONS.map((option) => {
                const isSelected =
                  selectedValues.has(option.value) ||
                  (selectedValues.size === 0 &&
                    option.value === allRangesStatusOption?.value);
                return (
                  <div
                    key={option.value}
                    role="presentation"
                    onClick={() => selectStatus(option.value)}
                    className="my-1 ml-1 mr-2 flex w-full cursor-pointer flex-row gap-x-2 rounded-lg p-1.5 hover:bg-slate-50"
                  >
                    <div
                      className={cn(
                        `h-4 w-4 rounded-full border border-${option.color} mt-[1px] flex items-center justify-center`,
                        isSelected
                          ? `text-primary-foreground`
                          : '[&_svg]:invisible',
                      )}
                    >
                      <Circle
                        className={cn(`h-3 w-3 fill-${option.color}`)}
                        strokeWidth={0}
                      />
                    </div>
                    <div className="flex flex-col gap-y-1.5 text-gray-500">
                      <span className="text-sm">{option.label}</span>
                      <span className="text-xs text-gray-400">
                        {option.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {/* Hack to include in tailwind compile */}
      {/* eslint-disable-next-line tailwindcss/no-contradicting-classname */}
      <div className="hidden border-fuchsia-400 border-green-400 border-yellow-300 border-zinc-300 fill-fuchsia-400 fill-green-400 fill-yellow-300 fill-zinc-300"></div>
    </>
  );
}
