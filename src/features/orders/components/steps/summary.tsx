import { Calendar, Check, MapPin } from 'lucide-react';
import moment from 'moment';
import React, { ReactNode } from 'react';

import { DotIcon } from '@/components/icons/dot';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  CreateOrderInput,
  UpdateOrderInput,
  useCreateOrder,
  useOrders,
  useUpdateOrder,
} from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { useService } from '@/features/services/api';
import { usePaymentMethods } from '@/features/settings/api';
import { CreatePaymentMethodForm } from '@/features/settings/components/billing/create-payment-method-form';
import { CurrentPaymentMethodCard } from '@/features/users/components/current-payment-method-card';
import { useStepper } from '@/lib/stepper';
import { OrderStatus } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

export function OrderSummary(): ReactNode {
  const {
    service,
    items,
    location,
    slot,
    collectionMethod,
    tz,
    informedConsent,
    updateCreatedOrderId,
  } = useOrder((s) => s);
  const { nextStep, prevStep } = useStepper((s) => s);
  const ordersQuery = useOrders({
    queryConfig: { refetchOnMount: 'always' },
  });
  const paymentMethodsQuery = usePaymentMethods();

  const serviceQuery = useService({
    serviceId: service.id,
    method: collectionMethod,
    items,
    queryConfig: {
      refetchOnMount: 'always',
    },
  });

  const defaultPaymentMethod = paymentMethodsQuery.data?.paymentMethods.find(
    (pm) => pm.default,
  );

  const existingDraftOrder = ordersQuery.data?.orders
    .filter((o) => o.status === OrderStatus.draft)
    .find((o) => o.serviceId === service.id);

  const price = serviceQuery.data?.service.price;

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const isMutationLoading =
    createOrderMutation.isPending || updateOrderMutation.isPending;

  const isQueryLoading =
    serviceQuery.isLoading ||
    ordersQuery.isLoading ||
    paymentMethodsQuery.isLoading;

  /*
   * If user books new service (draftOrderId was not initialized)
   *
   * we just create regular order
   * */
  const createOrderFn = async (): Promise<void> => {
    if (service === null)
      throw Error('There was a problem creating the order.');

    const data: CreateOrderInput = {
      serviceId: service.id,
      items,
      location: location ? location : {},
      timestamp: slot ? slot.start : new Date().toISOString(),
      timezone: tz || moment.tz.guess(),
      method: collectionMethod ? [collectionMethod] : [],
    };

    // if step requires consent, add it to the final data object we send to server
    if (informedConsent) {
      data.informedConsent = { agreedAt: new Date().toISOString() };
    }

    const response = await createOrderMutation.mutateAsync({
      data,
    });

    if (response.order) {
      updateCreatedOrderId(response.order.id);
      nextStep();
    }
  };

  const updateOrderFn = async (): Promise<void> => {
    if (!existingDraftOrder) {
      toast('No orderId found for previous order. Contact support.');
      return;
    }

    const data: UpdateOrderInput = {
      location: location ? location : {},
      timezone: tz || moment.tz.guess(),
      method: collectionMethod ? collectionMethod : undefined,

      timestamp: slot ? slot.start : new Date().toISOString(),
      status: OrderStatus.pending,
    };

    // if step requires consent, add it to the final data object we send to server
    if (informedConsent) {
      data.informedConsent = { agreedAt: new Date().toISOString() };
    }

    const response = await updateOrderMutation.mutateAsync({
      orderId: existingDraftOrder.id,
      data,
    });

    if (response.order) {
      nextStep();
    }
  };

  return (
    <>
      <div className="space-y-4 p-6 md:space-y-8 md:p-14">
        <H2>Order Summary</H2>
        {isQueryLoading ? (
          <>
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-[130px] w-full rounded-2xl" />
          </>
        ) : null}
        {defaultPaymentMethod && !isQueryLoading ? (
          <>
            {price !== undefined && price === 0 ? (
              <Alert className="mb-8" variant="success">
                <Check className="size-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  We found a free {service.name} that is included with your
                  membership.
                </AlertDescription>
              </Alert>
            ) : null}

            {price !== undefined ? (
              <CreateOrderSummaryItem basePrice={price} />
            ) : null}
            <CreateOrderAppointmentDetails />
            {price && price > 0 ? <CurrentPaymentMethodCard /> : null}
          </>
        ) : null}
        {!defaultPaymentMethod && !isQueryLoading ? (
          <div className="space-y-4">
            <H2>We do not have your payment method!</H2>
            <CreatePaymentMethodForm />
          </div>
        ) : null}
      </div>
      {defaultPaymentMethod ? (
        <HealthcareServiceFooter
          prevBtn={
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={prevStep}
              disabled={isMutationLoading}
            >
              Back
            </Button>
          }
          nextBtn={
            <Button
              onClick={existingDraftOrder ? updateOrderFn : createOrderFn}
              className="w-full md:w-auto"
              disabled={
                isMutationLoading || price === undefined || isQueryLoading
              }
            >
              {isMutationLoading ? (
                <TransactionSpinner className="flex justify-center" />
              ) : (
                'Confirm'
              )}
            </Button>
          }
        />
      ) : null}
    </>
  );
}

function CreateOrderAppointmentDetails() {
  const { slot, tz, location } = useOrder((s) => s);

  if (!slot && !location) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 p-6">
      <Body1>Appointment details</Body1>
      {slot ? (
        <div className="flex gap-4">
          <Calendar className="size-5 text-zinc-500" />
          <div className="space-y-1">
            <Body2 className="text-zinc-500">Date scheduled</Body2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <Body1>{moment(slot.start).tz(tz).format('MMM Do, YYYY')}</Body1>
              <DotIcon fill="#18181B" className="hidden sm:block" />
              <Body1>
                {moment(slot.start).tz(tz).format('h:mma')} -{' '}
                {moment(slot.end).tz(tz).format('h:mma z')}
              </Body1>
            </div>
          </div>
        </div>
      ) : null}
      {location?.address ? (
        <div className="flex gap-4">
          <MapPin className="size-5 text-zinc-500" />
          <div className="space-y-1">
            <Body2 className="text-zinc-500">Location</Body2>
            <div>
              <Body1>{location.address.line.join(' ')}</Body1>
              <Body1>
                {location.address.city}, {location.address.state},{' '}
                {location.address.postalCode}
              </Body1>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CreateOrderSummaryItem({
  basePrice,
}: {
  basePrice: number;
}): ReactNode {
  const { service, collectionMethod } = useOrder((s) => s);

  return (
    <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 p-6 md:flex-row md:items-center md:border-none md:p-0">
        <img
          src={service.image}
          alt={service.name}
          className="size-12 rounded-xl border border-zinc-200 object-cover object-center"
        />
        <div>
          <Body1>{service.name}</Body1>
          <div className="flex items-center gap-2">
            {service.phlebotomy && (
              <>
                <Body2 className="text-zinc-400">
                  {collectionMethod === 'IN_LAB'
                    ? 'In person lab'
                    : 'At home visit'}
                </Body2>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 md:hidden">
          Total: <Price basePrice={basePrice} />
        </div>
      </div>
      <div className="hidden text-nowrap md:block">
        <Price basePrice={basePrice} />
      </div>
    </div>
  );
}

const Price = ({ basePrice }: { basePrice: number }) => {
  return <Body1>{basePrice === 0 ? 'Included' : formatMoney(basePrice)}</Body1>;
};
