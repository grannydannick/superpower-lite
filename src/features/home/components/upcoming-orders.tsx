import { Spinner } from '@/components/ui/spinner';
import { UpcomingOrderCard } from '@/features/home/components/upcoming-order-card';
import { useOrders } from '@/features/orders/api';
import { Order, OrderStatus } from '@/types/api';

export function UpcomingOrdersList(): JSX.Element {
  const ordersQuery = useOrders();

  if (ordersQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!ordersQuery.data) return <></>;

  const { orders } = ordersQuery.data;

  const upcomingOrders = orders.filter(
    (order) => order.status.toUpperCase() === OrderStatus.upcoming,
  );

  if (upcomingOrders.length === 0) return <UpcomingOrdersListEmpty />;

  return (
    <div className="flex flex-col space-y-5">
      {upcomingOrders.map((order: Order, index) => (
        <UpcomingOrderCard {...order} key={index} />
      ))}
    </div>
  );
}

function UpcomingOrdersListEmpty(): JSX.Element {
  return (
    <div className="flex shrink-0 items-center justify-center rounded-md py-10">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <h3 className="mt-4 text-lg">No upcoming orders</h3>
        <p className="mb-4 mt-2 text-sm text-zinc-400">
          You have no upcoming orders.{' '}
          <a href="/services" className="text-vermillion-700">
            Request a new service.
          </a>
        </p>
      </div>
    </div>
  );
}
