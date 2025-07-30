import { Check } from 'lucide-react';
import moment from 'moment';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
import { GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useServices } from '@/features/services/api';
import { HealthcareService, Order, OrderStatus } from '@/types/api';

import { getImageForUpsellService } from '../../../utils/get-image-for-upsell-service';
import { ItemPreview } from '../item-preview';

const StatusAction = ({
  service,
  status,
  isScheduledService,
}: {
  service: HealthcareService;
  status: OrderStatus;
  isScheduledService: boolean;
}) => {
  return status === 'DRAFT' ? (
    <HealthcareServiceDialog healthcareService={service}>
      <Button size="medium">{isScheduledService ? 'Book' : 'Confirm'}</Button>
    </HealthcareServiceDialog>
  ) : (
    <div className="flex items-center gap-2">
      <Body2 className="text-vermillion-900">
        {isScheduledService ? 'Booked' : 'Confirmed'}
      </Body2>
      <Check className="size-5 text-vermillion-900" />{' '}
    </div>
  );
};

export const BookingCard = ({ order }: { order: Order }) => {
  // okay to use service here because it is cached
  const { data } = useServices();
  const service = data?.services.find((s) => s.id === order.serviceId);

  const image = service ? getImageForUpsellService(service) : undefined;

  // we might expand this in the future
  const isScheduledService = service?.name === GRAIL_GALLERI_MULTI_CANCER_TEST;

  console.log(order);

  return (
    <div className="flex w-full items-center justify-between rounded-3xl bg-white p-3 pr-5 shadow shadow-black/[.03]">
      <div className="flex items-center gap-4">
        {image && <ItemPreview className="size-16 rounded-xl" image={image} />}
        <div>
          <Body1>{order.name}</Body1>
          {order.status !== 'DRAFT' &&
            (isScheduledService ? (
              <Body1 className="text-zinc-500">
                Scheduled for{' '}
                {moment(order.startTimestamp).format('DD MMMM, HHa')}-
                {moment(order.endTimestamp).format('HHa')}
              </Body1>
            ) : (
              <Body1 className="text-zinc-500">Confirmation email sent.</Body1>
            ))}
        </div>
      </div>
      {service ? (
        <StatusAction
          status={order.status}
          service={service}
          isScheduledService={isScheduledService}
        />
      ) : (
        <Skeleton className="h-[56px] w-[101px]" />
      )}
    </div>
  );
};
