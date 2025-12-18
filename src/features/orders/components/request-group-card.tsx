import moment from 'moment-timezone';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Body1, Body2, Body3 } from '@/components/ui/typography';
import {
  HealthcareService,
  Order,
  OrderStatus,
  RequestGroup,
} from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

import { useServices } from '../../services/api';

export const RequestGroupCard = ({
  requestGroup,
}: {
  requestGroup: RequestGroup;
}) => {
  const navigate = useNavigate();

  const handleManage = () => {
    navigate(`/orders/${requestGroup.id}`);
  };

  // should always be cached so its fine
  const servicesQuery = useServices();

  const services = servicesQuery.data?.services ?? [];

  if (requestGroup.orders.length === 0) return null;

  // if (requestGroup.orders.length > 1)
  //   return (
  //     <GroupedCard
  //       handleManage={handleManage}
  //       requestGroup={requestGroup}
  //       services={services}
  //     />
  //   );

  // const order = requestGroup.orders[0];

  // return (
  //   <SingleCard handleManage={handleManage} order={order} services={services} />
  // );

  return (
    <GroupedCard
      handleManage={handleManage}
      requestGroup={requestGroup}
      services={services}
    />
  );
};

const GroupedCard = ({
  requestGroup,
  services,
  handleManage,
}: {
  requestGroup: RequestGroup;
  services: HealthcareService[];
  handleManage: () => void;
}) => {
  const orders = requestGroup.orders;

  const scheduledForWithTz =
    requestGroup.startTimestamp && requestGroup.timezone
      ? moment(requestGroup.startTimestamp)
          .tz(requestGroup.timezone)
          .format('MMM D, YYYY')
      : undefined;

  const isCompleted = requestGroup.status === OrderStatus.completed;

  return (
    <div className="overflow-hidden rounded-3xl bg-[#f5f5f7] px-4 pb-0 pt-3">
      <div className="mb-3 flex items-center justify-between">
        {!isCompleted && scheduledForWithTz ? (
          <div className="inline-flex items-center rounded-[6px] bg-zinc-100 px-[6px] py-0.5 mix-blend-multiply">
            <Body3 className="text-secondary">
              Scheduled for: {scheduledForWithTz}
            </Body3>
          </div>
        ) : (
          <div />
        )}

        <Button variant="white" size="small" onClick={handleManage}>
          Manage
        </Button>
      </div>

      <div className="-mx-4 rounded-3xl border bg-white px-4 py-3">
        {orders.map((o) => (
          <SingleCard order={o} services={services} key={o.id} />
        ))}
      </div>
    </div>
  );
};

const SingleCard = ({
  order,
  services,
  handleManage,
}: {
  order: Order;
  services: HealthcareService[];
  handleManage?: () => void;
}) => {
  const timezone = order.timezone ?? moment.tz.guess();

  const createdWithTz = order.createdAt
    ? moment(order.createdAt).tz(timezone).format('MMM D, YYYY')
    : '???';
  const price = services.find((s) => s.id === order.serviceId)?.price;

  return (
    <div className="flex items-center gap-3 py-2">
      <img
        className="size-16 rounded-lg object-cover"
        src={getServiceImage(order.serviceName)}
        alt={order.serviceName}
      />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          <Body1>{order.serviceName}</Body1>
          <Body2 className="text-zinc-500">
            {createdWithTz} · {price ? formatMoney(price) : '???'}
          </Body2>
        </div>
        {handleManage ? (
          <Button variant="white" size="small" onClick={handleManage}>
            Manage
          </Button>
        ) : null}
      </div>
    </div>
  );
};
