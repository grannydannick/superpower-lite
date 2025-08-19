import React, { useMemo } from 'react';

import { Body1, H2 } from '@/components/ui/typography';
import { RescheduleDialogMode } from '@/features/orders/types/reschedule-dialog-mode';
import { Order } from '@/types/api';
import { getServiceImage } from '@/utils/service';

export const HealthcareServiceRescheduleConfirmation = ({
  mode,
  order,
}: {
  mode: RescheduleDialogMode;
  order: Order;
}) => {
  const isWithin24Hours = useMemo(() => {
    const startTimestamp = new Date(order.startTimestamp).getTime();
    const now = new Date().getTime();
    return startTimestamp - now < 24 * 60 * 60 * 1000;
  }, [order.startTimestamp]);

  const isAtHomeAppointment = order.method.includes('AT_HOME');

  const lateFeeMessage = (() => {
    return mode === 'reschedule'
      ? 'Your appointment is within 24 hours. Rescheduling now will incur a $99 late fee.'
      : 'Your appointment is within 24 hours. Cancelling now will incur a $99 late fee.';
  })();

  return (
    <div className="flex flex-col justify-center gap-4 px-6 md:max-w-none md:px-10">
      <img
        src={getServiceImage(order.serviceName)}
        className="block size-[70px] rounded-2xl border border-zinc-200 bg-white  object-cover"
        alt={order.serviceName}
      />
      <div className="max-w-[220px] space-y-4 md:max-w-none">
        <H2 className="text-zinc-900">
          Are you sure you want to {mode} your {order.serviceName}?
        </H2>
      </div>
      {isWithin24Hours &&
        isAtHomeAppointment &&
        (mode === 'reschedule' || mode === 'cancel') && (
          <Body1 className="my-4 rounded-lg bg-vermillion-100 p-4 text-vermillion-900">
            {lateFeeMessage}
          </Body1>
        )}
      {mode === 'cancel' ? (
        <Body1 className="text-zinc-500">
          You can schedule a new appointment from the services page of the
          Superpower app.
        </Body1>
      ) : null}
    </div>
  );
};
