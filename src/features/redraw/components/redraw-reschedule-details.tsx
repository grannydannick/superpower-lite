import { format } from 'date-fns';
import { Calendar, CalendarX, ChevronRight } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import { Badge } from '@/components/ui/badge';
import { ProgressiveImage } from '@/components/ui/progressive-image';
import { Body1, Body2, H3, H4 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import { AppointmentDetails } from '@/features/orders/components/appointment-details';
import { Order, RequestGroup } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { RedrawRescheduleMode } from './redraw-reschedule-mode';

export function RedrawRescheduleDetails({
  requestGroup,
  redrawOrder,
  setMode,
}: {
  requestGroup: RequestGroup;
  redrawOrder: Order;
  setMode: Dispatch<SetStateAction<RedrawRescheduleMode>>;
}) {
  const serviceName =
    requestGroup.orders.length === 1
      ? requestGroup.orders[0].serviceName
      : undefined;
  const isAdvisoryCall = serviceName === ADVISORY_CALL;
  const redrawDetails = redrawOrder.redrawDetails;
  const scheduledTimestamp = redrawDetails?.startTimestamp;
  const scheduledEndTimestamp = redrawDetails?.endTimestamp;
  const scheduledTimezone = redrawDetails?.timezone;
  const scheduledConfirmationCode = redrawDetails?.confirmationCode;
  const scheduledCollectionMethod = redrawDetails?.collectionMethod;
  const scheduledAppointmentType = redrawDetails?.appointmentType;
  const scheduledAddress = redrawDetails?.address;

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
              <div className="flex items-center gap-2">
                <H3 className="text-zinc-900">{redrawOrder.serviceName}</H3>
                <Badge variant="vermillion">RECOLLECTION</Badge>
              </div>
              <div className="w-fit rounded-lg bg-zinc-100 py-[3px] pl-1.5 pr-2 mix-blend-multiply">
                <Body2 className="text-zinc-400">Scheduled</Body2>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <button
                className="flex w-full items-center justify-between rounded-xl border px-3 py-2"
                type="button"
                onClick={() => setMode('reschedule')}
              >
                <div className="flex flex-col items-start gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-4 text-secondary" />
                    <Body2 className="text-secondary">
                      Reschedule recollection
                    </Body2>
                  </div>
                  {scheduledTimestamp ? (
                    <Body1>
                      {format(new Date(scheduledTimestamp), 'MMM do, yyyy')}
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
                    <Body2 className="text-secondary">Cancel appointment</Body2>
                  </div>
                  <Body1>Cancel</Body1>
                </div>
                <ChevronRight className="size-4 text-secondary" />
              </button>
            </div>
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

      {scheduledAppointmentType ? (
        <AppointmentDetails
          collectionMethod={scheduledCollectionMethod}
          confirmationCode={scheduledConfirmationCode}
          slot={
            scheduledTimestamp && scheduledEndTimestamp
              ? {
                  start: scheduledTimestamp,
                  end: scheduledEndTimestamp,
                }
              : undefined
          }
          timezone={scheduledTimezone}
          location={
            scheduledAddress
              ? {
                  address: scheduledAddress,
                  capabilities: scheduledAppointmentType
                    ? [
                        scheduledAppointmentType === 'UNSCHEDULED'
                          ? 'WALK_IN'
                          : 'APPOINTMENT_SCHEDULING',
                      ]
                    : ['APPOINTMENT_SCHEDULING'],
                  name: '',
                  slots: [],
                }
              : undefined
          }
          orderIds={[redrawOrder.id]}
        />
      ) : !isAdvisoryCall && scheduledAddress ? (
        <div className="flex flex-col gap-4">
          <H4>Shipment</H4>
          <div className="flex flex-col gap-3 rounded-2xl border p-6 shadow-sm">
            <Body2 className="text-secondary">Shipping address</Body2>
            <div>
              <Body1>{scheduledAddress.line.join(' ')}</Body1>
              <Body1>
                {scheduledAddress.postalCode} {scheduledAddress.city}
              </Body1>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
