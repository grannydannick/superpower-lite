import { Table } from '@tanstack/react-table';
import { Circle, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Body2, Body3 } from '@/components/ui/typography';
import { STATUS_FILTER_NAME } from '@/features/biomarkers/const/filters';
import { STATUS_OPTIONS } from '@/features/biomarkers/const/status-options';
import { StatusFilterOptionType } from '@/features/biomarkers/types/filters';
import { getCurrentStatus } from '@/features/biomarkers/utils/get-current-status';
import { cn } from '@/lib/utils';

interface DataTableFacetedFilter<TData> {
  table: Table<TData>;
  title?: React.ReactNode;
}

export function StatusFilter<TData>({
  table,
  title,
}: DataTableFacetedFilter<TData>): JSX.Element {
  const [status, setStatus] = useState<StatusFilterOptionType>('All Ranges');
  const [open, setOpen] = useState<boolean>(false);

  // Intentionally set as empty string
  const defaultTitle = title ? title : STATUS_FILTER_NAME;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="small"
            className={cn(
              'bg-white rounded-lg py-2 px-3 text-sm text-zinc-500 hidden md:flex items-center gap-1.5',
              status === 'All Ranges' ? 'border-0' : '',
            )}
          >
            <div
              className={cn(
                `h-4 w-4 rounded-full border flex items-center justify-center`,
                getCurrentStatus(status).border,
              )}
            >
              <Circle
                className={cn(getCurrentStatus(status).fill)}
                strokeWidth={0}
                height={14}
                width={14}
              />
            </div>
            <p className="whitespace-nowrap text-sm font-normal">
              {status === 'All Ranges'
                ? defaultTitle
                : getCurrentStatus(status).label}
            </p>
            <ChevronDown
              className={cn(
                'size-4 min-w-4 transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="rounded-lg border-0 bg-white p-4 shadow-lg"
          align="end"
          side="bottom"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
              <Body2 className="text-zinc-700">Ranges</Body2>
              <div>
                <Button
                  variant="ghost"
                  size="small"
                  className="p-0 text-sm text-zinc-400 hover:bg-transparent"
                  onClick={() => {
                    table.getColumn('status')?.setFilterValue(undefined);
                    setStatus('All Ranges');
                  }}
                >
                  Restore default
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-y-1">
              {Object.values(STATUS_OPTIONS).map((option, indx) => {
                const isSelected = option.label === status;

                return (
                  <div
                    key={indx}
                    role="presentation"
                    onClick={() => {
                      setStatus(option.label as StatusFilterOptionType);
                      if (option.label === 'All Ranges') {
                        table.getColumn('status')?.setFilterValue(undefined);
                      } else {
                        table
                          .getColumn('status')
                          ?.setFilterValue(option.filters);
                      }
                    }}
                    className="flex w-full cursor-pointer gap-2 rounded-lg p-2 hover:bg-slate-50"
                  >
                    <div
                      className={cn(
                        `h-4 w-4 rounded-full border flex items-center justify-center`,
                        option.border,
                        isSelected
                          ? `text-primary-foreground`
                          : '[&_svg]:invisible',
                      )}
                    >
                      <Circle
                        className={cn(option.fill)}
                        height={14}
                        width={14}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Body2 className="text-zinc-500">{option.label}</Body2>
                      <Body3 className="text-zinc-500">
                        {option.description}
                      </Body3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default StatusFilter;
