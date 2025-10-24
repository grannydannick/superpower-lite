import { ChevronDown, CalendarPlus } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { OrderCard } from '@/features/services/components/order-card';
import { cn } from '@/lib/utils';

import { useVisibleOrders } from '../hooks/use-visible-orders';

export const OrdersList = React.memo((): JSX.Element => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const {
    isLoading,
    visibleOrders,
    totalFiltered,
    restOrders,
    defaultVisible,
  } = useVisibleOrders();

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (totalFiltered === 0) return <OrdersListEmpty />;

  return (
    <>
      <Collapsible open={collapsibleOpen} onOpenChange={setCollapsibleOpen}>
        <div className="grid gap-5 lg:grid-cols-2">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {restOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </CollapsibleContent>

        {totalFiltered > defaultVisible && (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="small"
              className="mx-auto mt-5 flex flex-row items-center space-x-2 text-secondary"
            >
              <Body1>
                {collapsibleOpen
                  ? 'Collapse'
                  : `${totalFiltered - defaultVisible} more bookings`}
              </Body1>
              <ChevronDown
                className={cn(
                  'size-4 transition-transform duration-300 ease-in-out',
                  collapsibleOpen ? 'rotate-180' : 'rotate-0',
                )}
              />
              <span className="sr-only">
                {collapsibleOpen
                  ? 'Collapse'
                  : `${totalFiltered - defaultVisible} more bookings`}
              </span>
            </Button>
          </CollapsibleTrigger>
        )}
      </Collapsible>
    </>
  );
});

OrdersList.displayName = 'OrdersList';

export const OrdersListEmpty = (): JSX.Element => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-300">
      <div className="group relative">
        <div
          className={cn(
            'mx-auto flex max-w-[420px] flex-col items-center justify-center text-center py-10 transition-all ease-out',
            'lg:group-hover:blur-sm lg:group-hover:opacity-30',
          )}
        >
          <h3 className="mt-4 text-lg">No orders yet</h3>
          <p className="mb-4 mt-2 text-sm text-secondary">
            You have not ordered any services.
          </p>
          {/* Mobile-only CTA (< md) */}
          <div className="lg:hidden">
            <Button asChild size="medium">
              <NavLink to="/services">Get Started</NavLink>
            </Button>
          </div>
        </div>

        <NavLink
          to="/services"
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'pointer-events-none opacity-0 scale-95 transition-all duration-200 ease-out',
            'lg:group-hover:opacity-100 lg:group-hover:scale-100 lg:pointer-events-auto',
            'active:opacity-100 active:scale-100',
          )}
          aria-label="Get started with services"
        >
          <div className="flex flex-col items-center gap-2 rounded-2xl">
            <CalendarPlus />
            <span className="text-base font-medium">Get Started</span>
          </div>
        </NavLink>
      </div>
    </div>
  );
};
