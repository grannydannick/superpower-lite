import { CheckCircle2Icon, CircleAlert, Clock4Icon } from 'lucide-react';

import { Body1, Body2, H2 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { ServiceFaqs } from '@/features/services/components/service-faqs';
import { HealthcareService, Order, OrderStatus } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { OrderAppointmentDetails } from '../order-appointment-details';

export function HealthcareServiceRescheduleDetails({
  healthcareService,
  order,
}: {
  healthcareService?: HealthcareService;
  order: Order;
}) {
  return (
    <div className="space-y-8 px-4">
      <BadgesDisplay order={order} />
      <div className="flex flex-col justify-center gap-4 md:max-w-none">
        <img
          src={getServiceImage(order.serviceName)}
          className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover"
          alt={order.serviceName}
        />
        <div className="max-w-[220px] space-y-4 md:max-w-none">
          <H2 className="text-zinc-900">{order.serviceName}</H2>
        </div>
        {healthcareService ? (
          <Body1 className="text-zinc-500">
            {healthcareService.description}
          </Body1>
        ) : null}
      </div>
      <OrderAppointmentDetails
        serviceName={order.serviceName}
        collectionMethod={order?.collectionMethod}
        performer={order?.performer}
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
                  : // fallback for legacy to always appointment schedyuling
                    ['APPOINTMENT_SCHEDULING'],
                name: '',
              }
            : undefined
        }
        orderId={order.id}
        selectedPanels={order.addOnServiceIds}
      />
      <ServiceFaqs
        filter={(faq) =>
          faq.question !== 'sampleReportLink' &&
          faq.question !== "What's tested?"
        }
        serviceName={order.serviceName}
      />
    </div>
  );
}

const BadgesDisplay = ({ order }: { order: Order }) => {
  const isPastAppointment = order.startTimestamp
    ? new Date(order.startTimestamp) < new Date()
    : false;

  return (
    <>
      {isPastAppointment && order.serviceName !== ADVISORY_CALL ? (
        <Pill
          Icon={Clock4Icon}
          bg="bg-vermillion-100"
          textColor="text-vermillion-900"
        >
          Results in progress
        </Pill>
      ) : null}
      {order.status === OrderStatus.cancelled ? (
        <Pill Icon={CircleAlert} bg="bg-pink-100" textColor="text-pink-900">
          Order cancelled
        </Pill>
      ) : null}
      {order.status === OrderStatus.completed ? (
        <Pill
          Icon={CheckCircle2Icon}
          bg="bg-emerald-100"
          textColor="text-emerald-900"
        >
          Order completed
        </Pill>
      ) : null}
    </>
  );
};

// TODO: probably replace with badge
const Pill = ({
  Icon,
  bg,
  textColor,
  children,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bg: string;
  textColor: string;
  children: React.ReactNode;
}) => (
  <div
    className={`inline-flex items-center space-x-1 self-start rounded-lg px-2 py-1 ${bg}`}
  >
    <Icon className={`size-4 ${textColor}`} />
    <Body2 className={textColor}>{children}</Body2>
  </div>
);
