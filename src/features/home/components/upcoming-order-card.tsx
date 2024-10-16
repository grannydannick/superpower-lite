import moment from 'moment';

import { AdvisoryCallButton } from '@/components/shared/advisory-call-button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ADVISORY_CALL, READY_NUM_HOURS_BEFORE_ADVISORY } from '@/const';
import { useServices } from '@/features/services/api';
import { Order } from '@/types/api';

export function UpcomingOrderCard(order: Order): JSX.Element {
  const { data, isLoading } = useServices();

  const date = moment(order.timestamp).tz(moment.tz.guess());
  const address = order.location.address;

  const healthcareService = data?.services.find(
    (s) => s.id === order.serviceId,
  );

  return (
    <Card>
      <div className="flex flex-col justify-between p-6 lg:flex-row lg:items-center">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          {!isLoading ? (
            <img
              src={healthcareService?.image}
              alt={order.name}
              className="size-[80px] min-w-[80px] rounded-lg border border-zinc-200 object-cover"
            />
          ) : (
            <Skeleton className="h-[80px] min-w-[80px] rounded-lg" />
          )}
          <div className="space-y-2 md:space-y-1">
            <h2 className="text-xl text-primary">{order.name}</h2>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              {order.location.webAddress ? (
                <p className="line-clamp-1">
                  Zoom link will be available {READY_NUM_HOURS_BEFORE_ADVISORY}{' '}
                  hours before the call
                </p>
              ) : address ? (
                <p className="line-clamp-1">{address.line.join(', ')}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-6 lg:mt-0 lg:flex-row lg:items-center">
          <div className="flex flex-row text-sm text-zinc-400 lg:flex-col">
            <>
              <span>{date.format('MMMM Do')}</span>
              <svg
                className={`mx-1.5 w-1 fill-[#A5A5AD] lg:hidden`}
                viewBox="0 0 2 2"
                aria-hidden="true"
              >
                <circle cx={1} cy={1} r={1} />
              </svg>
              <span>{date.format('h:mma')}</span>
            </>
          </div>
          {order.name === ADVISORY_CALL ? (
            <AdvisoryCallButton order={order} />
          ) : null}
        </div>
      </div>
    </Card>
  );
}
