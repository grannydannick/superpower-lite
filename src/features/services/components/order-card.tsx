import { toast } from 'sonner';

import { TimestampDisplay } from '@/components/shared/timestamp-display';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCancelOrder } from '@/features/orders/api/cancel-order';
import { useServices } from '@/features/services/api';
import { OrderStatusBadge } from '@/features/services/components/order-status-badge';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/types/api';

export function OrderCard(order: Order) {
  const { data, isLoading } = useServices();

  const service = data?.services.find((s) => s.id === order.serviceId);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Skeleton className="h-[126px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!service) return null;

  return (
    <Card
      className={cn(
        'bg-zinc-50 p-4',
        order.status.toUpperCase() === OrderStatus.cancelled
          ? 'grayscale opacity-50'
          : '',
      )}
    >
      <div className="flex flex-row space-x-4">
        <div className="hidden sm:block">
          <OrderCardFeatureImage imagePath={service.image} />
        </div>
        <div className="flex w-full min-w-0 flex-col justify-between gap-4">
          <OrderCardHeader {...order} />
          <OrderCardDetails {...order} />
        </div>
      </div>
    </Card>
  );
}

function OrderCardHeader({ id, name, status, timestamp }: Order): JSX.Element {
  const { data: user } = useUser();
  const { mutateAsync } = useCancelOrder({
    mutationConfig: {
      onSuccess: () => toast.warning('Cancelled order!'),
    },
  });

  const actions: { label: string; onClick: () => void }[] = [];
  if (
    ([
      '1-1 Advisory Call',
      'Superpower Blood Panel',
      'Custom Blood Panel',
    ].includes(name) &&
      status.toUpperCase() === 'UPCOMING' &&
      new Date(timestamp).getTime() >
        new Date().getTime() - 24 * 60 * 60 * 1000) ||
    Boolean(user?.adminActor)
  ) {
    actions.push({
      label: 'Cancel',
      onClick: async () => {
        await mutateAsync({ orderId: id });
      },
    });
  }

  return (
    <div className="flex flex-row justify-between space-y-0 text-sm sm:flex-col sm:space-y-1 lg:flex-row lg:space-y-0">
      <h2 className="line-clamp-1 text-xl text-primary">{name}</h2>
      <OrderStatusBadge
        className="select-none"
        variant={status.toLowerCase() as any}
        actions={actions}
      />
    </div>
  );
}

function OrderCardDetails({
  timestamp,
  timezone,
  location,
}: Order): JSX.Element {
  return (
    <div className="flex flex-col justify-between space-y-0 text-base sm:space-y-1 lg:space-y-0">
      <span className="truncate text-primary">
        <TimestampDisplay timestamp={new Date(timestamp)} timezone={timezone} />
      </span>
      <span className="truncate text-secondary">
        {location.address?.line.join(', ')}
      </span>
    </div>
  );
}

export function OrderCardFeatureImage({
  imagePath,
}: {
  imagePath: string | undefined;
}): JSX.Element {
  if (!imagePath) {
    return (
      <Skeleton className="aspect-square size-[114px] w-full rounded-lg" />
    );
  }

  return (
    <img
      alt="Order"
      src={imagePath}
      className="aspect-square size-[114px] h-full rounded-xl border border-zinc-200 object-cover"
    />
  );
}
