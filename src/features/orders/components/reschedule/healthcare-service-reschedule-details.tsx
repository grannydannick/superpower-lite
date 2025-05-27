import { Clock4Icon } from 'lucide-react';

import { Body1, Body2, H2 } from '@/components/ui/typography';
import { ServiceDetails } from '@/features/orders/components/service-details';
import { HealthcareService, Order } from '@/types/api';

import { OrderAppointmentDetails } from '../order-appointment-details';

export function HealthcareServiceRescheduleDetails({
  healthcareService,
  order,
  resultsPending,
}: {
  healthcareService: HealthcareService;
  order: Order;
  resultsPending: boolean;
}) {
  return (
    <div>
      <div className="space-y-8 px-6 md:px-10">
        <div className="flex flex-col justify-center gap-4 md:max-w-none">
          <img
            src={healthcareService.image}
            className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover"
            alt={healthcareService.name}
          />
          {resultsPending && (
            <div className="inline-flex items-center space-x-1 self-start rounded-lg bg-vermillion-100 px-2 py-1">
              <Clock4Icon className="size-4 text-vermillion-900" />
              <Body2 className="text-vermillion-900">Results in progress</Body2>
            </div>
          )}
          <div className="max-w-[220px] space-y-4 md:max-w-none">
            <H2 className="text-zinc-900">{healthcareService.name}</H2>
          </div>
          <Body1 className="text-zinc-500">
            {healthcareService.description}
          </Body1>
        </div>
        <OrderAppointmentDetails
          serviceName={healthcareService.name}
          collectionMethod={order?.method[0]}
          slot={{
            start: order.startTimestamp,
            end: order.endTimestamp,
          }}
          timezone={order.timezone}
          location={order.location}
          orderId={order.id}
        />
      </div>

      <ServiceDetails serviceName={healthcareService.name} />
    </div>
  );
}
