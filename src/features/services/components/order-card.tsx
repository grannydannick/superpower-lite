import React, { useMemo } from 'react';

import { TimestampDisplay } from '@/components/shared/timestamp-display';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
import {
  ADVISORY_CALL,
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { useServices } from '@/features/services/api';
import { OrderStatusBadge } from '@/features/services/components/order-status-badge';
import { useAuthorization } from '@/lib/authorization';
import { cn } from '@/lib/utils';
import { Order, OrderStatus, HealthcareService } from '@/types/api';
import { getServiceImage } from '@/utils/service';

interface OrderCardProps {
  order: Order;
  onReschedule?: (order: Order, service?: HealthcareService) => void;
}

export const OrderCard = React.memo(
  ({ order, onReschedule }: OrderCardProps) => {
    const { data, isLoading } = useServices();
    const { checkAdminActorAccess } = useAuthorization();

    const service = useMemo(
      () => data?.services.find((s) => s.id === order.serviceId),
      [data?.services, order.serviceId],
    );

    if (isLoading) {
      return (
        <div className="flex w-full items-center justify-center">
          <Skeleton className="h-[126px] w-full rounded-3xl" />
        </div>
      );
    }

    const isCancelled = order.status.toUpperCase() === OrderStatus.cancelled;
    const isCompleted = order.status.toUpperCase() === OrderStatus.completed;
    const isUpcoming = order.status.toUpperCase() === OrderStatus.upcoming;

    const stateStyles = (() => {
      if (isCancelled) {
        return 'grayscale opacity-50';
      }
      if (isCompleted) {
        return 'opacity-75';
      }

      return 'hover:bg-zinc-200 hover:scale-[1.02] hover:shadow-md cursor-pointer';
    })();

    const isModifiableService = [
      ADVISORY_CALL,
      SUPERPOWER_BLOOD_PANEL,
      CUSTOM_BLOOD_PANEL,
      ADVANCED_BLOOD_PANEL,
      GRAIL_GALLERI_MULTI_CANCER_TEST,
    ].includes(order.serviceName);

    const isAdminActor = checkAdminActorAccess();

    const canReschedule =
      isModifiableService && !isCancelled && !isCompleted && isUpcoming;

    const handleCardClick = () => {
      if (canReschedule && onReschedule) {
        onReschedule(order, service);
      }
    };

    const adminCancelAction = {
      label: 'Admin Override Cancel',
      onClick: () => {
        onReschedule?.(order, service);
      },
    };

    const actions = isAdminActor ? [adminCancelAction] : [];

    return (
      <Card
        className={cn(
          'bg-zinc-100 p-5 flex flex-col justify-center gap-4 md:flex-row transition-all duration-200',
          stateStyles,
        )}
        onClick={handleCardClick}
      >
        <div className="flex justify-between md:justify-start">
          <OrderCardFeatureImage
            imagePath={getServiceImage(order.serviceName)}
          />
          <div className="block md:hidden">
            <OrderCardBadge order={order} actions={actions} />
          </div>
        </div>
        <div className="flex w-full flex-col">
          <div className="flex justify-between">
            <Body1 className="line-clamp-1">{order.serviceName}</Body1>
            <div className="hidden md:block">
              <OrderCardBadge order={order} actions={actions} />
            </div>
          </div>
          <OrderCardDetails {...order} />
        </div>
      </Card>
    );
  },
);

OrderCard.displayName = 'OrderCard';

export const OrderCardBadge = React.memo(
  ({
    order,
    actions,
  }: {
    order: Order;
    actions: { label: string; onClick: () => void }[];
  }): JSX.Element => {
    return (
      <OrderStatusBadge
        className="w-fit select-none"
        actions={actions}
        order={order}
      />
    );
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
