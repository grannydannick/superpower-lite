import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import { OrderCard } from '@/features/services/components/order-card';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';

const DEFAULT_VISIBLE = 12;

export function OrdersList(): JSX.Element {
  const { data, isLoading } = useOrders();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!data) return <></>;

  if (data.orders.length === 0) return <OrdersListEmpty />;

  let { orders } = data;

  orders = orders.filter(
    (order) => order.status.toUpperCase() !== OrderStatus.draft,
  );

  const vibileOrders = orders.slice(0, DEFAULT_VISIBLE);
  const restOrders = orders.slice(DEFAULT_VISIBLE, orders.length);

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="grid gap-5 lg:grid-cols-2">
          {vibileOrders.map((order, index) => (
            <OrderCard {...order} key={index} />
          ))}
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {restOrders.map((order, index) => (
              <OrderCard {...order} key={index} />
            ))}
          </div>
        </CollapsibleContent>

        {orders.length > DEFAULT_VISIBLE && !isLoading && (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="mx-auto mt-5 flex flex-row items-center space-x-2 text-secondary"
            >
              <Body1>
                {open
                  ? 'Collapse'
                  : `${orders.length - DEFAULT_VISIBLE} more bookings`}
              </Body1>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform duration-300 ease-in-out',
                  open ? 'rotate-180' : 'rotate-0',
                )}
              />
              <span className="sr-only">
                {open
                  ? 'Collapse'
                  : `${orders.length - DEFAULT_VISIBLE} more bookings`}
              </span>
            </Button>
          </CollapsibleTrigger>
        )}
      </Collapsible>
    </>
  );
}

export function OrdersListEmpty(): JSX.Element {
  return (
    <div className="flex shrink-0 items-center justify-center rounded-md border border-dashed border-zinc-300 py-10">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg">No orders yet</h3>
        <p className="mb-4 mt-2 text-sm text-secondary">
          You have not ordered any services. Book one below.
        </p>
      </div>
    </div>
  );
}
