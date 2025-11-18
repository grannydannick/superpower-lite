import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Body1 } from '@/components/ui/typography';
import { LAB_ORDER_SUPPORTED_SERVICES } from '@/const/services';
import { useOrders } from '@/features/orders/api';
import { OrderStatus } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { HomepageCard } from '../components/homepage-card';

export const ActiveOrdersCard = () => {
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();

  const upcomingLabOrders = useMemo(() => {
    const orders = ordersData?.orders ?? [];
    return orders.filter(
      (order) =>
        order.status === OrderStatus.upcoming &&
        !LAB_ORDER_SUPPORTED_SERVICES.includes(order.serviceName),
    );
  }, [ordersData]);

  if (isOrdersLoading) {
    return (
      <HomepageCard title="Active Orders">
        <div className="h-4 w-48 animate-pulse rounded bg-zinc-200" />
      </HomepageCard>
    );
  }

  if (upcomingLabOrders.length === 0) {
    return null;
  }

  return (
    <HomepageCard title="Active Orders">
      <div>
        {upcomingLabOrders.map((order, index) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="group relative flex items-center gap-3 p-2"
          >
            <div className="flex shrink-0 items-center gap-3">
              <div className="relative flex size-4 items-center justify-center rounded-full bg-vermillion-100">
                <div className="size-1.5 rounded-full bg-vermillion-900" />
              </div>
              <img
                src={getServiceImage(order.serviceName)}
                alt={order.serviceName}
                className="size-20 shrink-0 rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-1 items-center gap-3">
              <div className="flex-1">
                <Body1 className="text-zinc-900">{order.serviceName}</Body1>
              </div>
              <ChevronRight className="size-5 text-zinc-400 transition-all group-hover:-mr-1" />
            </div>
            {index < upcomingLabOrders.length - 1 && (
              <div className="absolute bottom-0 left-[80px] right-1 border-b border-zinc-200" />
            )}
          </Link>
        ))}
      </div>
    </HomepageCard>
  );
};
