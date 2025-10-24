import React from 'react';
import { useNavigate } from 'react-router-dom';

import { TimestampDisplay } from '@/components/shared/timestamp-display';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
import { OrderStatusBadge } from '@/features/services/components/order-status-badge';
import { cn } from '@/lib/utils';
import { Order } from '@/types/api';
import { getServiceImage } from '@/utils/service';

interface OrderCardProps {
  order: Order;
}

export const OrderCard = React.memo(({ order }: OrderCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <Card
      className={cn(
        'bg-zinc-100 p-5 flex flex-col justify-center gap-4 md:flex-row transition-all duration-200',
        'hover:bg-zinc-200 hover:scale-[1.02] hover:shadow-md cursor-pointer',
      )}
      onClick={handleCardClick}
    >
      <div className="flex justify-between md:justify-start">
        <OrderCardFeatureImage imagePath={getServiceImage(order.serviceName)} />
        <div className="block md:hidden">
          <OrderCardBadge order={order} />
        </div>
      </div>
      <div className="flex w-full flex-col">
        <div className="flex justify-between">
          <Body1 className="line-clamp-1">{order.serviceName}</Body1>
          <div className="hidden md:block">
            <OrderCardBadge order={order} />
          </div>
        </div>
        <OrderCardDetails {...order} />
      </div>
    </Card>
  );
});

OrderCard.displayName = 'OrderCard';

export const OrderCardBadge = React.memo(
  ({ order }: { order: Order }): JSX.Element => {
    return <OrderStatusBadge className="w-fit select-none" order={order} />;
  },
);

OrderCardBadge.displayName = 'OrderCardBadge';

export const OrderCardDetails = React.memo(
  ({ startTimestamp, timezone, location }: Order): JSX.Element => {
    return (
      <div className="flex flex-col gap-0.5">
        {startTimestamp ? (
          <Body2 className="text-zinc-500">
            <TimestampDisplay
              timestamp={new Date(startTimestamp)}
              timezone={timezone}
            />
          </Body2>
        ) : null}
        <Body2 className="line-clamp-1 text-zinc-400">
          {location.address?.line.join(', ')}
        </Body2>
      </div>
    );
  },
);

OrderCardDetails.displayName = 'OrderCardDetails';

export const OrderCardFeatureImage = React.memo(
  ({ imagePath }: { imagePath: string | undefined }): JSX.Element => {
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
  },
);

OrderCardFeatureImage.displayName = 'OrderCardFeatureImage';
