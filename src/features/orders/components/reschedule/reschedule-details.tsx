import { CheckCircle2Icon, CircleAlert, Clock4Icon } from 'lucide-react';

import { ChevronLeft } from '@/components/icons/chevron-left-icon';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Body2, H2 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { cn } from '@/lib/utils';
import { OrderStatus, RequestGroup } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { AppointmentDetails } from '../appointment-details';

export function RescheduleDetails({
  requestGroup,
}: {
  requestGroup: RequestGroup;
}) {
  const orders = requestGroup.orders;

  // TODO: create helper for this
  const serviceName = orders.length === 1 ? orders[0].serviceName : undefined;

  return (
    <div className="space-y-8 px-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <Link
          to="/orders"
          className="group -ml-1.5 flex items-center gap-0.5 p-0"
        >
          <ChevronLeft className="-mt-px w-[15px] text-zinc-400 transition-all duration-150 group-hover:-translate-x-0.5 group-hover:text-zinc-600" />
          <Body2 className="text-zinc-500 transition-all duration-150 group-hover:text-zinc-700">
            Back
          </Body2>
        </Link>
        <BadgesDisplay requestGroup={requestGroup} />
      </div>
      <div className="flex flex-col justify-center gap-4 md:max-w-none">
        <img
          src={
            serviceName
              ? getServiceImage(serviceName)
              : '/services/custom_blood_panel.png'
          }
          className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover"
          alt={'Superpower service'}
        />
        <div className="max-w-[220px] space-y-4 md:max-w-none">
          <H2 className="text-zinc-900">
            {requestGroup.orders.map((o) => o.serviceName).join(', ')}
          </H2>
        </div>
      </div>
      <AppointmentDetails
        collectionMethod={requestGroup?.collectionMethod}
        slot={
          requestGroup.startTimestamp && requestGroup.endTimestamp
            ? {
                start: requestGroup.startTimestamp,
                end: requestGroup.endTimestamp,
              }
            : undefined
        }
        timezone={requestGroup.timezone}
        location={
          requestGroup?.address
            ? {
                address: requestGroup.address,
                capabilities: requestGroup.appointmentType
                  ? [
                      requestGroup.appointmentType === 'UNSCHEDULED'
                        ? 'WALK_IN'
                        : 'APPOINTMENT_SCHEDULING',
                    ]
                  : // fallback for legacy to always appointment schedyuling
                    ['APPOINTMENT_SCHEDULING'],
                name: '',
              }
            : undefined
        }
        orderIds={requestGroup.orders.map((o) => o.id)}
      />
    </div>
  );
}

const BadgesDisplay = ({ requestGroup }: { requestGroup: RequestGroup }) => {
  const isPastAppointment = requestGroup.startTimestamp
    ? new Date(requestGroup.startTimestamp) < new Date()
    : false;

  const isAdvisoryCall =
    requestGroup.orders.length === 1 &&
    requestGroup.orders[0].serviceName === ADVISORY_CALL;

  return (
    <>
      {isPastAppointment &&
        requestGroup.status !== OrderStatus.completed &&
        !isAdvisoryCall && (
          <Pill
            Icon={Clock4Icon}
            className="bg-vermillion-100 text-vermillion-900"
          >
            Results in progress
          </Pill>
        )}
      {requestGroup.status === OrderStatus.revoked && (
        <Pill Icon={CircleAlert} className="bg-pink-100 text-pink-900">
          Order cancelled
        </Pill>
      )}
      {requestGroup.status === OrderStatus.completed && (
        <Pill
          Icon={CheckCircle2Icon}
          className="bg-emerald-100 text-emerald-900"
        >
          Order completed
        </Pill>
      )}
    </>
  );
};

const Pill = ({
  Icon,
  className,
  children,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className: string;
  children: React.ReactNode;
}) => (
  <Badge className={cn(className, 'w-fit gap-2 mt-0')}>
    <Icon className="size-4" />
    <Body2 className="text-current">{children}</Body2>
  </Badge>
);
