import { TZDateMini } from '@date-fns/tz';
import { format } from 'date-fns';
import { Calendar, ChevronDownIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { RadioButton } from '@/components/ui/radio-button';
import { Body1 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import type { RequestGroup } from '@/types/api';
import { resolveTimeZone } from '@/utils/timezone';

import { useDataFilterStore } from '../../stores/data-filter-store';

export const DateFilter = () => {
  const { selectedOrder, updateSelectedOrder, clearSelectedOrder } =
    useDataFilterStore();
  const ordersQuery = useOrders();

  const requestGroups: RequestGroup[] = [];
  const allRequestGroups = ordersQuery.data?.requestGroups;

  if (allRequestGroups != null) {
    for (const rg of allRequestGroups) {
      if (rg.appointmentType === undefined) continue;
      if (rg.status === 'revoked') continue;
      requestGroups.push(rg);
    }
  }

  if (requestGroups.length <= 1) {
    return null;
  }

  let selectedOrderLabel = 'All dates';
  if (selectedOrder != null) {
    const ts =
      selectedOrder.endTimestamp ??
      selectedOrder.startTimestamp ??
      selectedOrder.createdAt;

    if (ts == null) {
      selectedOrderLabel = 'Walk-In';
    } else {
      const timeZone = resolveTimeZone(selectedOrder.timezone);
      try {
        selectedOrderLabel = format(new TZDateMini(ts, timeZone), 'MM/dd/yyyy');
      } catch {
        selectedOrderLabel = format(new Date(ts), 'MM/dd/yyyy');
      }
    }
  }

  const requestGroupNodes: React.ReactElement[] = [];

  for (const rg of requestGroups) {
    const timeZone = resolveTimeZone(rg.timezone);
    const ts = rg.endTimestamp ?? rg.startTimestamp ?? rg.createdAt;
    let label = 'Walk-In';

    if (ts != null) {
      try {
        label = format(new TZDateMini(ts, timeZone), 'MM/dd/yyyy');
      } catch {
        label = format(new Date(ts), 'MM/dd/yyyy');
      }
    }

    requestGroupNodes.push(
      <DropdownMenuItem key={rg.id} onClick={() => updateSelectedOrder(rg)}>
        <RadioButton checked={selectedOrder?.id === rg.id} />
        <Body1>{label}</Body1>
      </DropdownMenuItem>,
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 px-4 text-zinc-500">
          <Calendar className="size-4 xs:hidden" />
          <Body1 className="hidden text-neutral-500 xs:block">
            {selectedOrderLabel}
          </Body1>
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            clearSelectedOrder();
          }}
        >
          <RadioButton checked={selectedOrder == null} />
          <Body1>All dates</Body1>
        </DropdownMenuItem>
        {requestGroupNodes}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
