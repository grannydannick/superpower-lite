import { TZDateMini } from '@date-fns/tz';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import React from 'react';

import { ChevronRightIcon } from '@/components/icons/chevron-right-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Body1, Body2 } from '@/components/ui/typography';
import { isScheduledRedrawOrder } from '@/features/redraw/utils/get-scheduled-redraw-order';
import {
  HealthcareService,
  Order,
  OrderStatus,
  RequestGroup,
} from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';
import { resolveTimeZone } from '@/utils/timezone';

import { useServices } from '../../services/api';

type RequestGroupCardProps = {
  requestGroups: RequestGroup[];
};

export const RequestGroupCard: React.FC<RequestGroupCardProps> = ({
  requestGroups,
}) => {
  const navigate = useNavigate();
  const servicesQuery = useServices();
  const services = servicesQuery.data?.services ?? [];

  if (!requestGroups?.length) return null;

  return (
    <div>
      {requestGroups.map((group, index) => (
        <div key={group.id}>
          <RequestGroupItems
            group={group}
            services={services}
            onManage={() => {
              void navigate({ to: '/orders/$id', params: { id: group.id } });
            }}
          />
          {requestGroups.length - 1 !== index && (
            <div className="my-2 h-px w-full bg-zinc-200" />
          )}
        </div>
      ))}
    </div>
  );
};

function RequestGroupItems({
  group,
  services,
  onManage,
}: {
  group: RequestGroup;
  services: HealthcareService[];
  onManage: () => void;
}) {
  let scheduledForWithTz: string | undefined = undefined;
  if (group.startTimestamp != null && group.timezone != null) {
    const timeZone = resolveTimeZone(group.timezone);
    scheduledForWithTz = format(
      new TZDateMini(group.startTimestamp, timeZone),
      'MMM d, yyyy',
    );
  }

  const isCompleted = group.status === OrderStatus.completed;

  if (!group.orders.length) return null;

  return (
    <div className="space-y-2">
      <div className="-mx-1">
        {group.orders.map((order) => (
          <RequestItemRow
            key={order.id}
            order={order}
            services={services}
            onManage={onManage}
            scheduledFor={!isCompleted ? scheduledForWithTz : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function RequestItemRow({
  order,
  services,
  onManage,
  scheduledFor,
}: {
  order: Order;
  services: HealthcareService[];
  onManage?: () => void;
  scheduledFor?: string;
}) {
  const timeZone = resolveTimeZone(order.timezone);
  const createdWithTz =
    order.createdAt == null
      ? undefined
      : format(new TZDateMini(order.createdAt, timeZone), 'MMM d, yyyy');
  const price = services.find((s) => s.id === order.serviceId)?.price;
  const isScheduledRedraw = isScheduledRedrawOrder(order);
  let scheduledForLabel = scheduledFor;

  if (
    isScheduledRedraw &&
    order.redrawDetails?.startTimestamp != null &&
    order.redrawDetails?.timezone != null
  ) {
    const redrawTimeZone = resolveTimeZone(order.redrawDetails.timezone);
    scheduledForLabel = format(
      new TZDateMini(order.redrawDetails.startTimestamp, redrawTimeZone),
      'MMM d, yyyy',
    );
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <img
        className="size-20 rounded-lg object-cover"
        src={getServiceImage(order.serviceName)}
        alt={order.serviceName}
      />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          {scheduledForLabel && (
            <Badge variant="vermillion" className="mb-1 w-fit">
              Scheduled for: {scheduledForLabel}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <Body1>{order.serviceName}</Body1>
            {isScheduledRedraw ? (
              <Badge variant="vermillion">RECOLLECTION</Badge>
            ) : null}
          </div>
          <Body2 className="text-zinc-500">
            {createdWithTz && price
              ? `${createdWithTz} · ${formatMoney(price)}`
              : (createdWithTz ?? (price ? formatMoney(price) : null))}
          </Body2>
        </div>
        {onManage && (
          <Button
            variant="white"
            size="small"
            onClick={onManage}
            className="max-md:border-none"
          >
            <span className="hidden md:block">Manage</span>
            <ChevronRightIcon className="size-4 text-secondary md:hidden" />
          </Button>
        )}
      </div>
    </div>
  );
}
