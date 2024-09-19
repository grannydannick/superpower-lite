import { toast } from 'sonner';

import { TimestampDisplay } from '@/components/shared/timestamp-display';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
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
        'bg-zinc-100 p-5',
        order.status.toUpperCase() === OrderStatus.cancelled
          ? 'grayscale opacity-50'
          : '',
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex items-center justify-between">
          <OrderCardFeatureImage imagePath={service.image} />
          <div className="block md:hidden">
            <OrderCardBadge {...order} />
          </div>
        </div>
        <div className="flex w-full flex-col justify-between">
          <div className="flex justify-between">
            <Body1 className="line-clamp-1">{service.name}</Body1>
            <div className="hidden md:block">
              <OrderCardBadge {...order} />
            </div>
          </div>
          <OrderCardDetails {...order} />
        </div>
      </div>
    </Card>
  );
}

function OrderCardBadge({ id, name, status, timestamp }: Order): JSX.Element {
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
      label: 'Cancel appointment',
      onClick: async () => {
        await mutateAsync({ orderId: id });
      },
    });
  }

  return (
    <OrderStatusBadge
      className="w-fit select-none"
      variant={status.toLowerCase() as any}
      actions={actions}
    />
  );
}

function OrderCardDetails({
  timestamp,
  timezone,
  location,
}: Order): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5">
      <Body2 className="text-zinc-500">
        <TimestampDisplay timestamp={new Date(timestamp)} timezone={timezone} />
      </Body2>
      <Body2 className="line-clamp-1 text-zinc-400">
        {location.address?.line.join(', ')}
      </Body2>
    </div>
  );
}

export function OrderCardFeatureImage({
  imagePath,
}: {
  imagePath: string | undefined;
}): JSX.Element {
  if (!imagePath) {
    return <Skeleton className="aspect-square h-12 min-w-12 rounded-lg" />;
  }

  return (
    <img
      alt="Order"
      src={imagePath}
      className="aspect-square h-12 min-w-12 rounded-xl object-cover"
    />
  );
}
