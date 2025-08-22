import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { HealthcareServiceRescheduleDialog } from '@/features/orders/components/reschedule/healthcare-service-reschedule-dialog';
import { OrderCard } from '@/features/services/components/order-card';
import { cn } from '@/lib/utils';
import { HealthcareService, Order } from '@/types/api';

import { useFilteredOrders } from '../hooks/use-filtered-orders';

export const OrdersList = React.memo((): JSX.Element => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    order: Order;
    service?: HealthcareService;
  } | null>(null);

  const {
    isLoading,
    visibleOrders,
    totalFiltered,
    restOrders,
    defaultVisible,
  } = useFilteredOrders();

  const handleReschedule = (order: Order, service?: HealthcareService) => {
    setRescheduleDialog({ order, service });
    setDialogOpen(true);
  };

  const handleRescheduleClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setRescheduleDialog(null);
    }
  };

  const handleSubmit = () => {
    setDialogOpen(false);
    setRescheduleDialog(null);
  };

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
            <OrderCard
              key={order.id}
              order={order}
              onReschedule={handleReschedule}
            />
          ))}
        </div>

        <CollapsibleContent>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {restOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onReschedule={handleReschedule}
              />
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

      {rescheduleDialog && (
        <HealthcareServiceRescheduleDialog
          order={rescheduleDialog.order}
          healthcareService={rescheduleDialog.service}
          open={dialogOpen}
          onOpenChange={handleRescheduleClose}
          onSubmit={handleSubmit}
        >
          <div />
        </HealthcareServiceRescheduleDialog>
      )}
    </>
  );
});

OrdersList.displayName = 'OrdersList';

export const OrdersListEmpty = (): JSX.Element => {
  return (
    <div className="flex shrink-0 items-center justify-center rounded-3xl border border-dashed border-zinc-300 py-10">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg">No orders yet</h3>
        <p className="mb-4 mt-2 text-sm text-secondary">
          You have not ordered any services.
        </p>
      </div>
    </div>
  );
};
