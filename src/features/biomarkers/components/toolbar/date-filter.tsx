import { Table } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import moment from 'moment';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Body2 } from '@/components/ui/typography';
import {
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { useOrders } from '@/features/orders/api';
import { cn } from '@/lib/utils';

interface DataTableFacetedFilter<TData> {
  table: Table<TData>;
  title?: React.ReactNode;
}

export function DateFilter<TData>({
  table,
}: DataTableFacetedFilter<TData>): JSX.Element | null {
  const [open, setOpen] = useState<boolean>(false);
  const ordersQuery = useOrders();

  const orders =
    ordersQuery.data?.orders.filter(
      (o) =>
        [
          SUPERPOWER_BLOOD_PANEL,
          ADVANCED_BLOOD_PANEL,
          CUSTOM_BLOOD_PANEL,
        ].includes(o.serviceName) && o.status === 'COMPLETED',
    ) ?? [];

  // Member has one blood test => Date filter is not available
  if (orders.length <= 1) {
    return null;
  }

  const orderFilter = table.getColumn('orderId')?.getFilterValue();

  const selectedOrder = orders.find((o) => o.id === orderFilter);

  const getDateText = () => {
    if (selectedOrder?.startTimestamp && selectedOrder?.timezone) {
      const m = moment(selectedOrder.startTimestamp).tz(selectedOrder.timezone);

      return m.isValid() ? m.format('MM/DD/YYYY') : 'Date unavailable';
    }

    return 'Date unavailable';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="small"
          className={cn(
            'bg-white rounded-lg py-2 px-3 text-sm text-zinc-500 hidden md:flex items-center gap-1.5',
            orderFilter ? 'border-vermillion-900' : 'border-none',
          )}
        >
          <Body2 className="text-zinc-500">
            {selectedOrder ? getDateText() : 'All results'}
          </Body2>
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
            <Body2 className="text-zinc-700">Test date</Body2>
            <div>
              <Button
                variant="ghost"
                size="small"
                className="p-0 text-sm text-zinc-400 hover:bg-transparent"
                onClick={() => {
                  table.getColumn('orderId')?.setFilterValue(undefined);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-2.5">
            {orders.map((o) => {
              return (
                <Button
                  variant="ghost"
                  className={cn(
                    'justify-start px-4 py-2.5 hover:bg-zinc-50 text-sm',
                    orderFilter === o.id ? 'bg-zinc-50' : null,
                  )}
                  key={o.id}
                  onClick={() =>
                    table.getColumn('orderId')?.setFilterValue(o.id)
                  }
                >
                  {o?.startTimestamp && o?.timezone
                    ? moment(o.startTimestamp)
                        .tz(o.timezone)
                        .format('MM/DD/YYYY')
                    : 'Date unavailable'}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DateFilter;
