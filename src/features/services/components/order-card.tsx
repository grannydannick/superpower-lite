import moment from 'moment';
import { toast } from 'sonner';

import { TimestampDisplay } from '@/components/shared/timestamp-display';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
import {
  ADVANCED_BLOOD_PANEL,
  ADVISORY_CALL,
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { useCancelOrder } from '@/features/orders/api/cancel-order';
import { useServices } from '@/features/services/api';
import { OrderStatusBadge } from '@/features/services/components/order-status-badge';
import { useAuthorization } from '@/lib/authorization';
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
        'bg-zinc-100 p-5 flex flex-col justify-center gap-4 md:flex-row',
        order.status.toUpperCase() === OrderStatus.cancelled
          ? 'grayscale opacity-50'
          : '',
      )}
    >
      <div className="flex justify-between md:justify-start">
        <OrderCardFeatureImage imagePath={service.image} />
        <div className="block md:hidden">
          <OrderCardBadge order={order} />
        </div>
      </div>
      <div className="flex w-full flex-col">
        <div className="flex justify-between">
          <Body1 className="line-clamp-1">{service.name}</Body1>
          <div className="hidden md:block">
            <OrderCardBadge order={order} />
          </div>
        </div>
        <OrderCardDetails {...order} />
      </div>
    </Card>
  );
}

function OrderCardBadge({ order }: { order: Order }): JSX.Element {
  const { id, name, status, timestamp, timezone } = order;
  const { checkAdminActorAccess } = useAuthorization();
  const { mutateAsync } = useCancelOrder({
    mutationConfig: {
      onSuccess: () => toast.warning('Cancelled order!'),
    },
  });

  const isAdmin = checkAdminActorAccess();
  const isLessThan24Hours =
    moment(timestamp).tz(timezone).diff(moment().tz(timezone), 'hours') <= 24;

  const isUpcoming = status.toUpperCase() === OrderStatus.upcoming;
  const isAllowedToCancelService = [
    ADVISORY_CALL,
    SUPERPOWER_BLOOD_PANEL,
    CUSTOM_BLOOD_PANEL,
    ADVANCED_BLOOD_PANEL,
  ].includes(name);

  const actions: { label: string; onClick: () => void }[] = [];
  if (
    (isAllowedToCancelService && isUpcoming && !isLessThan24Hours) ||
    isAdmin
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
      order={order}
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
