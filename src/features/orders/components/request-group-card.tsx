import moment from 'moment-timezone';
import React from 'react';
import { useNavigate } from 'react-router';

import { ChevronRightIcon } from '@/components/icons/chevron-right-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Body1, Body2 } from '@/components/ui/typography';
import {
  HealthcareService,
  Order,
  OrderStatus,
  RequestGroup,
} from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

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
            onManage={() => navigate(`/orders/${group.id}`)}
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
  const scheduledForWithTz =
    group.startTimestamp && group.timezone
      ? moment(group.startTimestamp).tz(group.timezone).format('MMM D, YYYY')
      : undefined;

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
  const timezone = order.timezone ?? moment.tz.guess();
  const createdWithTz = order.createdAt
    ? moment(order.createdAt).tz(timezone).format('MMM D, YYYY')
    : undefined;
  const price = services.find((s) => s.id === order.serviceId)?.price;

  return (
    <div className="flex items-center gap-3 py-2">
      <img
        className="size-20 rounded-lg object-cover"
        src={getServiceImage(order.serviceName)}
        alt={order.serviceName}
      />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          {scheduledFor && (
            <Badge variant="vermillion" className="mb-1 w-fit">
              Scheduled for: {scheduledFor}
            </Badge>
          )}
          <Body1>{order.serviceName}</Body1>
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
