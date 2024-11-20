import { Check } from 'lucide-react';
import moment from 'moment';
import { ReactNode } from 'react';
import { toast } from 'sonner';

import { DotIcon } from '@/components/icons/dot';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { ADVISORY_CALL } from '@/const';
import {
  CreateOrderInput,
  UpdateOrderInput,
  useCreateOrder,
  useOrders,
  useUpdateOrder,
} from '@/features/orders/api';
import { HealthcareServiceFooter } from '@/features/orders/components/healthcare-service-footer';
import { useOrder } from '@/features/orders/stores/order-store';
import { getDraftOrderUpsell } from '@/features/orders/utils/get-draft-order-upsell';
import { useService } from '@/features/services/api';
import { DefaultPaymentMethod } from '@/features/users/components/default-payment-method';
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
  const ordersQuery = useOrders();

  const serviceQuery = useService({
    serviceId: service.id,
    method: collectionMethod,
    items,
  });

  const existingDraftOrder = ordersQuery.data?.orders
    .filter((o) => o.status === OrderStatus.draft)
    .find((o) => o.serviceId === service.id);

  const price = existingDraftOrder
    ? getDraftOrderUpsell(
        collectionMethod,
        existingDraftOrder,
        serviceQuery.data?.service,
      )
    : serviceQuery.data?.service.price;

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const isMutationLoading =
    createOrderMutation.isPending ||
    updateOrderMutation.isPending ||
    ordersQuery.isLoading;

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
      status: service.name === ADVISORY_CALL ? OrderStatus.draft : undefined,
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

  /*
   * If we initially called dialog with `draftOrderId` then
   * we will just update existing order
   * */
  const updateOrderFn = async (): Promise<void> => {
    if (!existingDraftOrder) {
      toast.warning('No orderId found for previous order. Contact support.');
      return;
    }

    const data: UpdateOrderInput = {
      location: location ? location : {},
      timezone: tz || moment.tz.guess(),
      method: collectionMethod ? collectionMethod : undefined,

      timestamp: slot ? slot.start : new Date().toISOString(),
      status:
        service.name === ADVISORY_CALL
          ? OrderStatus.draft
          : OrderStatus.pending,
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
      <div className="p-6 md:p-14">
        {price !== undefined && price === 0 ? (
          <Alert className="mb-12" variant="success">
            <Check className="size-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              We found a free {service.name} that is included with your
              membership.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="md:space-y-8">
          <H2>Order Summary</H2>
          {price !== undefined ? (
            <CreateOrderSummaryItem basePrice={price} />
          ) : null}
        </div>
        {price && price > 0 ? <DefaultPaymentMethod /> : null}
      </div>
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
            disabled={isMutationLoading || price === undefined}
          >
            {isMutationLoading ? <Spinner /> : 'Confirm'}
          </Button>
        }
      />
    </>
  );
}

function CreateOrderSummaryItem({
  basePrice,
}: {
  basePrice: number;
}): ReactNode {
  const { service, slot, collectionMethod, tz } = useOrder((s) => s);

  return (
    <div className="flex flex-col items-start justify-between space-y-4 py-3 sm:flex-row sm:items-center sm:space-y-0">
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 p-6 md:flex-row md:items-center md:border-none md:p-0">
        <img
          src={service.image}
          alt={service.name}
          className="size-12 rounded-xl border border-zinc-200 object-cover object-center"
        />
        <div className="flex flex-col">
          <Body1>{service.name}</Body1>
          <div className="flex items-center gap-2">
            {service.phlebotomy && (
              <>
                <Body2 className="text-zinc-400">
                  {collectionMethod === 'IN_LAB'
                    ? 'In person lab'
                    : 'At home visit'}
                </Body2>
                <DotIcon />
              </>
            )}
            {slot && (
              <Body2 className="text-zinc-400">
                {moment(slot.start).tz(tz).format('MMMM Do, h:mma')}
                {'-'}
                {moment(slot.end).tz(tz).format('h:mma z')}
              </Body2>
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
