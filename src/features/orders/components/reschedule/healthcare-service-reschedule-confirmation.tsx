import { useMemo } from 'react';

import { Body1, H2 } from '@/components/ui/typography';
import { getAtHomePrice } from '@/const';
import { RescheduleDialogMode } from '@/features/orders/types/reschedule-dialog-mode';
import { Order } from '@/types/api';
import { formatMoney } from '@/utils/format-money';
import { getServiceImage } from '@/utils/service';

export const HealthcareServiceRescheduleConfirmation = ({
  mode,
  order,
}: {
  mode: RescheduleDialogMode;
  order: Order;
}) => {
  const isWithin24Hours = useMemo(() => {
    if (!order.startTimestamp) return false;

    const startTimestamp = new Date(order.startTimestamp).getTime();
    const now = new Date().getTime();
    return startTimestamp - now < 24 * 60 * 60 * 1000;
  }, [order.startTimestamp]);

  const isAtHomeAppointment = order.collectionMethod === 'AT_HOME';

  const atHomePrice = getAtHomePrice(order.location.address?.state);

  const lateFeeMessage = (() => {
    const formattedPrice = formatMoney(atHomePrice);
    return mode === 'reschedule'
      ? `Your appointment is within 24 hours. As you are rescheduling within 24 hours of your appointment, your ${formattedPrice} booking fee is non-refundable.`
      : `Your appointment is within 24 hours. As you are cancelling within 24 hours of your appointment, your ${formattedPrice} booking fee is non-refundable.`;
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
        order.appointmentType === 'UNSCHEDULED' ? (
          <Body1 className="text-zinc-500">
            If you’ve already completed your lab visit, please don’t cancel —
            your order will automatically update once we receive your results.
            Canceling after your visit may delay or prevent your results from
            appearing in your portal.
          </Body1>
        ) : (
          <Body1 className="text-zinc-500">
            You can schedule a new appointment from the services page of the
            Superpower app.
          </Body1>
        )
      ) : null}
    </div>
  );
};
