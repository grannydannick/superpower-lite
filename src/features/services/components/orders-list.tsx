import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
import { OrderStatus } from '@/types/api';

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

  const defaultVisible = 4;

  let { orders } = data;

  orders = orders.filter(
    (order) => order.status.toUpperCase() !== OrderStatus.draft,
  );

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* Default Visible */}
        <div className="grid gap-5 md:grid-cols-2">
          {orders.slice(0, defaultVisible).map((order, index) => (
            <OrderCard {...order} key={index} />
          ))}
        </div>

        {/* Default Invisible */}
        <AnimatePresence initial={false}>
          {open && (
            <CollapsibleContent asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {orders
                    .slice(defaultVisible, orders.length)
                    .map((order, index) => (
                      <OrderCard {...order} key={index} />
                    ))}
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>

        {orders.length > defaultVisible && !isLoading && (
          <CollapsibleTrigger asChild>
            {open ? (
              <Button
                variant="ghost"
                size="sm"
                className="mx-auto mt-5 flex flex-row items-center space-x-2 text-secondary"
              >
                <Body1>Collapse</Body1>
                <ChevronUp className="size-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mx-auto mt-5 flex flex-row items-center space-x-2 text-secondary"
              >
                <Body1>{`${orders.length - defaultVisible} more bookings`}</Body1>
                <ChevronDown className="size-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            )}
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
