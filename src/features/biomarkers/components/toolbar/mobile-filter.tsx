import { Table } from '@tanstack/react-table';
import { Circle, SlidersHorizontal, X } from 'lucide-react';
import moment from 'moment';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Body2, Body3, H2 } from '@/components/ui/typography';
import { SUPERPOWER_BLOOD_PANEL } from '@/const';
import { STATUS_OPTIONS } from '@/features/biomarkers/const/status-options';
import { CATEGORY_OPTIONS } from '@/features/biomarkers/const/toolbar-options';
import { StatusFilterOptionType } from '@/features/biomarkers/types/filters';
import { useOrders } from '@/features/orders/api';
import { cn } from '@/lib/utils';

interface MobileFilterProps<TData> {
  table: Table<TData>;
}

export function MobileFilter<TData>({
  table,
}: MobileFilterProps<TData>): JSX.Element {
  const categoryFilters =
    (table.getColumn('category')?.getFilterValue() as string[]) ?? [];
  return (
    <Sheet>
      <SheetTrigger>
        <Button
          variant="outline"
          size="small"
          className={cn(
            'bg-white rounded-lg py-2 px-3 text-sm text-zinc-500 flex items-center gap-1',
          )}
        >
          {categoryFilters.length > 0 && (
            <Body2 className="text-zinc-700">{categoryFilters.length}</Body2>
          )}
          <SlidersHorizontal className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
        <SheetHeader>
          <div className="flex w-full items-center justify-between pb-4">
            <SheetClose>
              <div className="flex h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-100">
                <X className="h-4 min-w-4" />
              </div>
            </SheetClose>
            <Body2>Biomarker Filters</Body2>
            <div className="min-w-[44px]" />
          </div>
        </SheetHeader>
        <div className="overflow-y-auto">
          <MobileDatesFilter table={table} />
          <MobileRangesFilter table={table} />
          <MobileCategoryFilter table={table} />
        </div>
        <SheetFooter
          className="p-4"
          style={{
            boxShadow:
              '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 13px 10px rgb(0 0 0 / 0.1)',
          }}
        >
          <SheetClose>
            <Button variant="default" className="w-full">
              Filter Biomarkers
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const MobileCategoryFilter = <TData,>({ table }: MobileFilterProps<TData>) => {
  const _categoryFilters =
    (table.getColumn('category')?.getFilterValue() as string[]) ?? [];

  const [categoryFilters, setCategoryFilters] =
    useState<string[]>(_categoryFilters);

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <div className="flex items-center justify-between">
        <H2>Categories</H2>
        <div>
          <Button
            variant="ghost"
            size="small"
            className="h-auto p-0 text-sm text-gray-400 hover:bg-transparent"
            onClick={() => {
              setCategoryFilters([]);
              table.getColumn('category')?.setFilterValue(undefined);
            }}
          >
            Clear selection
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {CATEGORY_OPTIONS.map((option) => {
          return (
            <div key={option.id} className="flex w-full items-center gap-2 p-2">
              <Checkbox
                id={option.id}
                checked={categoryFilters.includes(option.label)}
                onCheckedChange={(checked) =>
                  setCategoryFilters((prev) => {
                    const updated = checked
                      ? [...prev, option.label]
                      : prev.filter((value) => value !== option.label);

                    table
                      .getColumn('category')
                      ?.setFilterValue(updated.length ? updated : undefined);
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
  );
};

const MobileDatesFilter = <TData,>({ table }: MobileFilterProps<TData>) => {
  const ordersQuery = useOrders();

  const orders =
    ordersQuery.data?.orders.filter(
      (o) => o.name === SUPERPOWER_BLOOD_PANEL && o.status === 'COMPLETED',
    ) ?? [];

  const shouldRenderDatesFilter = orders.length > 1;
  const orderFilter = table.getColumn('orderId')?.getFilterValue();
  const selectedOrder = orders.find((o) => o.id === orderFilter);

  return shouldRenderDatesFilter ? (
    <div className="flex flex-col gap-4 px-6 py-4">
      <div className="flex items-center justify-between">
        <H2>Results</H2>
        <div>
          <Button
            variant="ghost"
            size="small"
            className="h-auto p-0 text-sm text-gray-400 hover:bg-transparent"
            onClick={() => {
              table.getColumn('orderId')?.setFilterValue(undefined);
            }}
          >
            Clear selection
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {orders.map((order, indx) => {
          const isSelected = order.id === selectedOrder?.id;

          return (
            <div
              key={indx}
              role="presentation"
              onClick={() =>
                table.getColumn('orderId')?.setFilterValue(order.id)
              }
              className="flex w-full cursor-pointer gap-2 rounded-lg p-2 hover:bg-slate-50"
            >
              <div
                className={cn(
                  `h-4 w-4 rounded-full border flex items-center justify-center border-zinc-200`,
                  isSelected
                    ? `border-primary text-primary-foreground`
                    : '[&_svg]:invisible',
                )}
              >
                <Circle className="fill-zinc-900" height={14} width={14} />
              </div>
              <Body2 className="text-zinc-500">
                {moment(order.startTimestamp)
                  .tz(order.timezone)
                  .format('YYYY/MM/DD')}
              </Body2>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
};

const MobileRangesFilter = <TData,>({ table }: MobileFilterProps<TData>) => {
  const [status, setStatus] = useState<StatusFilterOptionType>('All Ranges');

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      <div className="flex items-center justify-between">
        <H2>Ranges</H2>
        <div>
          <Button
            variant="ghost"
            size="small"
            className="h-auto p-0 text-sm text-gray-400 hover:bg-transparent"
            onClick={() => {
              setStatus('All Ranges');
              table.getColumn('status')?.setFilterValue(undefined);
            }}
          >
            Clear selection
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
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
                  table.getColumn('status')?.setFilterValue(option.filters);
                }
              }}
              className="flex w-full cursor-pointer gap-2 rounded-lg p-2 hover:bg-zinc-50"
            >
              <div
                className={cn(
                  `h-4 w-4 rounded-full border flex items-center justify-center`,
                  option.border,
                  isSelected ? `text-primary-foreground` : '[&_svg]:invisible',
                )}
              >
                <Circle className={cn(option.fill)} height={14} width={14} />
              </div>
              <div className="flex flex-col gap-1">
                <Body2 className="text-zinc-500">{option.label}</Body2>
                <Body3 className="text-zinc-500">{option.description}</Body3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFilter;
