import { format } from 'date-fns';
import { Calendar, CalendarX, ChevronRight } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { cn } from '@/lib/utils';
import { OrderStatus, RequestGroup } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { useAppointmentManagement } from '../../hooks/use-appointment-management';
import { AppointmentDetails } from '../appointment-details';

import { RescheduleMode } from './reschedule-mode';

export function RescheduleDetails({
  requestGroup,
  setMode,
}: {
  requestGroup: RequestGroup;
  setMode: Dispatch<SetStateAction<RescheduleMode>>;
}) {
  const { canManageAppointment } = useAppointmentManagement({
    requestGroup,
  });

  const orders = requestGroup.orders;
  const serviceName = orders.length === 1 ? orders[0].serviceName : undefined;

  const isAdvisoryCall = serviceName === ADVISORY_CALL;

  return (
    <div className="flex flex-col justify-center gap-10 md:max-w-none">
      <div className="space-y-6">
        <ProgressiveImage
          src={
            serviceName
              ? getServiceImage(serviceName)
              : '/services/custom_blood_panel.png'
          }
          alt={'Superpower service'}
          className="h-[337px] w-full rounded-[20px] bg-zinc-50 object-contain"
        />

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col justify-between md:flex-row md:items-center">
              <H3 className="text-zinc-900">
                {requestGroup.orders
                  .map((order) => order.serviceName)
                  .join(', ')}
              </H3>
              <StatusDisplay requestGroup={requestGroup} />
            </div>
            {canManageAppointment ? (
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <button
                  className="flex w-full items-center justify-between rounded-xl border px-3 py-2"
                  type="button"
                  onClick={() => setMode('reschedule')}
                >
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-4 text-secondary" />
                      <Body2 className="text-secondary">Reschedule test</Body2>
                    </div>
                    {requestGroup.startTimestamp ? (
                      <Body1>
                        {format(
                          new Date(requestGroup.startTimestamp),
                          'MMM do, yyyy',
                        )}
                      </Body1>
                    ) : (
                      <Body1>Walk-In</Body1>
                    )}
                  </div>
                  <ChevronRight className="size-4 text-secondary" />
                </button>

                <button
                  className="flex w-full items-center justify-between rounded-xl border px-3 py-2"
                  type="button"
                  onClick={() => setMode('cancel')}
                >
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <CalendarX className="size-4 text-secondary" />
                      <Body2 className="text-secondary">
                        Cancel appointment
                      </Body2>
                    </div>
                    <Body1>Cancel</Body1>
                  </div>
                  <ChevronRight className="size-4 text-secondary" />
                </button>
              </div>
            ) : null}
          </div>

          {requestGroup.createdAt ? (
            <div className="flex flex-col justify-between md:flex-row md:items-center">
              <Body1>Purchase date</Body1>
              <Body1 className="text-secondary">
                {format(new Date(requestGroup.createdAt), 'MMM do, yyyy')}
              </Body1>
            </div>
          ) : null}
        </div>
      </div>

      {requestGroup.appointmentType ? (
        <AppointmentDetails
          collectionMethod={requestGroup.collectionMethod}
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
            requestGroup.address
              ? {
                  address: requestGroup.address,
                  capabilities: requestGroup.appointmentType
                    ? [
                        requestGroup.appointmentType === 'UNSCHEDULED'
                          ? 'WALK_IN'
                          : 'APPOINTMENT_SCHEDULING',
                      ]
                    : ['APPOINTMENT_SCHEDULING'],
                  name: '',
                  slots: [],
                }
              : undefined
          }
          orderIds={requestGroup.orders.map((order) => order.id)}
        />
      ) : !isAdvisoryCall ? (
        <div className="flex flex-col gap-4">
          <H4>Shipment</H4>
          <div className="flex flex-col gap-3 rounded-2xl border p-6 shadow-sm">
            <Body2 className="text-secondary">Shipping address</Body2>
            <div>
              <Body1>{requestGroup.address?.line.join(' ')}</Body1>
              <Body1>
                {requestGroup.address?.postalCode} {requestGroup.address?.city}
              </Body1>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const StatusDisplay = ({ requestGroup }: { requestGroup: RequestGroup }) => {
  const isPastAppointment = requestGroup.startTimestamp
    ? new Date(requestGroup.startTimestamp) < new Date()
    : false;

  const isAdvisoryCall =
    requestGroup.orders.length === 1 &&
    requestGroup.orders[0].serviceName === ADVISORY_CALL;

  if (requestGroup.extendedStatus) {
    return (
      <Pill className="bg-vermillion-100 text-vermillion-900">
        {requestGroup.extendedStatus}
      </Pill>
    );
  }
  return (
    <>
      {isPastAppointment &&
        requestGroup.status !== OrderStatus.completed &&
        !isAdvisoryCall && (
          <Pill className="bg-vermillion-100 text-vermillion-900">
            Results in progress
          </Pill>
        )}
      {requestGroup.status === OrderStatus.revoked && (
        <Pill className="bg-pink-100 text-pink-900">Order cancelled</Pill>
      )}
      {requestGroup.status === OrderStatus.completed && (
        <Pill className="bg-emerald-100 text-emerald-900">Order completed</Pill>
      )}
      {!isPastAppointment && requestGroup.status === OrderStatus.active && (
        <Pill className="bg-zinc-100 text-zinc-400">Scheduled</Pill>
      )}
    </>
  );
};

const Pill = ({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      'w-fit rounded-lg bg-vermillion-100 py-[3px] pl-1.5 pr-2 mix-blend-multiply',
      className,
    )}
  >
    <Body2 className="text-current">{children}</Body2>
  </div>
);
