import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { useOrders } from '@/features/orders/api';
import { OrderStatus } from '@/types/api';

import { useServices } from '../api/get-services';

import { ServiceCard } from './service-card';

export const FinishScheduleList = () => {
  const servicesQuery = useServices();
  const ordersQuery = useOrders();

  const isQueryLoading = servicesQuery.isLoading || ordersQuery.isLoading;

  if (isQueryLoading) {
    return (
      <div className="grid grid-cols-1 gap-1 sm:gap-x-3 sm:gap-y-9 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(9)
          .fill(0)
          .map((_, i) => (
            <Skeleton
              className="h-[76px] w-full rounded-[20px] md:h-[386px] md:rounded-3xl"
              key={i}
            />
          ))}
      </div>
    );
  }

  if (!servicesQuery.data || !ordersQuery.data) return null;

  const draftOrders = ordersQuery.data.orders.filter(
    (o) => o.status === OrderStatus.draft,
  );

  if (draftOrders.length === 0)
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Body1 className="text-zinc-500">Nothing here at this time.</Body1>
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-1 sm:gap-x-3 sm:gap-y-9 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {draftOrders.map((draftOrder) => {
        const service = servicesQuery.data.services.find(
          (service) => service.id === draftOrder.serviceId,
        );

        if (!service) {
          return null;
        }

        return (
          <ServiceCard
            key={draftOrder.id}
            service={service}
            draftOrder={draftOrder}
          />
        );
      })}
    </div>
  );
};
