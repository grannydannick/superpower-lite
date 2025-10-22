import { Clock4Icon } from 'lucide-react';

import { Body1, Body2, H2 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { ServiceFaqs } from '@/features/services/components/service-faqs';
import { HealthcareService, Order } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { OrderAppointmentDetails } from '../order-appointment-details';

export function HealthcareServiceRescheduleDetails({
  healthcareService,
  order,
}: {
  healthcareService?: HealthcareService;
  order: Order;
}) {
  const isPastAppointment = order.startTimestamp
    ? new Date(order.startTimestamp) < new Date()
    : false;

  return (
    <div>
      <div className="space-y-8 px-6 md:px-10">
        <div className="flex flex-col justify-center gap-4 md:max-w-none">
          <img
            src={getServiceImage(order.serviceName)}
            className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover"
            alt={order.serviceName}
          />
          {isPastAppointment && order.serviceName !== ADVISORY_CALL ? (
            <div className="inline-flex items-center space-x-1 self-start rounded-lg bg-vermillion-100 px-2 py-1">
              <Clock4Icon className="size-4 text-vermillion-900" />
              <Body2 className="text-vermillion-900">Results in progress</Body2>
            </div>
          ) : null}
          <div className="max-w-[220px] space-y-4 md:max-w-none">
            <H2 className="text-zinc-900">{order.serviceName}</H2>
          </div>
          <Body1 className="text-zinc-500">
            {healthcareService?.description ??
              // this will likely never hit but can after 199 migration (superpower v2)
              // this is because we depricated old services to normalize data
              // please double check with Dan or Nikita before removing
              'Description is not available at the moment.'}
          </Body1>
        </div>
        <OrderAppointmentDetails
          serviceName={order.serviceName}
          collectionMethod={order?.collectionMethod}
          slot={
            order.startTimestamp && order.endTimestamp
              ? {
                  start: order.startTimestamp,
                  end: order.endTimestamp,
                }
              : undefined
          }
          timezone={order.timezone}
          location={
            order.location?.address
              ? {
                  address: order.location?.address,
                  capabilities: order.appointmentType
                    ? [
                        order.appointmentType === 'UNSCHEDULED'
                          ? 'WALK_IN'
                          : 'APPOINTMENT_SCHEDULING',
                      ]
                    : [],
                  name: '',
                }
              : undefined
          }
          orderId={order.id}
          selectedPanels={order.addOnServiceIds}
        />
      </div>

      <div className="px-6 md:px-10">
        <ServiceFaqs
          filter={(faq) =>
            faq.question !== 'sampleReportLink' &&
            faq.question !== "What's tested?"
          }
          serviceName={order.serviceName}
        />
      </div>
    </div>
  );
}
