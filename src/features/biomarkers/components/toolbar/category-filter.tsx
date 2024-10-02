import { Table } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Body2 } from '@/components/ui/typography';
import { CATEGORY_FILTER_NAME } from '@/features/biomarkers/const/filters';
import { CATEGORY_OPTIONS } from '@/features/biomarkers/const/toolbar-options';
import { cn } from '@/lib/utils';

interface DataTableFacetedFilter<TData> {
  table: Table<TData>;
  title?: React.ReactNode;
}

export function CategoryFilter<TData>({
  table,
  title,
}: DataTableFacetedFilter<TData>): JSX.Element {
  const [filters, setFilters] = useState<string[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const defaultTitle = title ? title : CATEGORY_FILTER_NAME;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'bg-white rounded-lg py-2 px-3 text-sm text-zinc-500 hidden md:flex items-center gap-1.5',
            filters.length ? 'border-vermillion-900' : 'border-none',
          )}
        >
          {filters.length > 0 ? (
            <div className="flex flex-row items-center gap-x-1.5">
              <div className="size-4 min-w-4 rounded-full bg-vermillion-700 text-center text-xs text-white">
                {filters.length}
              </div>
              <Body2 className="text-zinc-500">Categories</Body2>
            </div>
          ) : (
            defaultTitle
          )}
          <ChevronDown
            className={cn(
              'size-4 min-w-4 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-[456px] rounded-lg border-0 bg-white p-4 shadow-lg"
        align="end"
        side="bottom"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between">
            <Body2 className="text-zinc-700">Categories</Body2>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 text-sm text-zinc-400 hover:bg-transparent"
                onClick={() => {
                  setFilters([]);
                  table.getColumn('category')?.setFilterValue(undefined);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-2.5 md:grid-cols-2">
            {CATEGORY_OPTIONS.map((option) => {
              return (
                <div
                  key={option.id}
                  className="flex w-full items-center gap-2 p-2"
                >
                  <Checkbox
                    id={option.id}
                    checked={filters.includes(option.label)}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => {
                        const updated = checked
                          ? [...prev, option.label]
                          : prev.filter((value) => value !== option.label);

                        table
                          .getColumn('category')
                          ?.setFilterValue(
                            updated.length ? updated : undefined,
                          );
                        return updated;
                      })
                    }
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-sm bg-zinc-100 border-0 data-[state=checked]:bg-vermillion-100 data-[state=checked]:text-vermillion-900',
                    )}
                  />
                  <Label
                    className="line-clamp-1 text-nowrap text-sm text-zinc-500"
                    htmlFor={option.id}
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default CategoryFilter;
