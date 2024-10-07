import { TriangleAlert } from 'lucide-react';
import moment from 'moment';
import { ReactNode } from 'react';
import { toast } from 'sonner';

import { DotIcon } from '@/components/icons/dot';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  CreateOrderInput,
  useCreateOrder,
  useOrders,
  useUpdateOrder,
} from '@/features/orders/api';
import { useOrder } from '@/features/orders/stores/order-store';
import { getDraftCollectionMethod } from '@/features/orders/utils/get-draft-collection-method';
import { useService } from '@/features/services/api';
import { usePaymentMethods } from '@/features/settings/api';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';
import { capitalize } from '@/utils/format';
import { formatMoney } from '@/utils/format-money';

export function OrderSummary(): ReactNode {
  const {
    service,
    items,
    location,
    slot,
    collectionMethod,
    tz,
    draftOrder,
    informedConsent,
    updateCreatedOrderId,
  } = useOrder((s) => s);
  const { activeStep, nextStep, steps, prevStep } = useStepper((s) => s);
  const paymentMethodsQuery = usePaymentMethods();
  const ordersQuery = useOrders();

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const existingDraftOrder = ordersQuery.data?.orders
    .filter((o) => o.status === OrderStatus.draft)
    .find((o) => o.serviceId === service.id);

  const isMutationLoading =
    createOrderMutation.isPending ||
    updateOrderMutation.isPending ||
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
      status:
        service.name === '1-1 Advisory Call'
          ? ('DRAFT' as OrderStatus)
          : undefined,
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

  const defaultPaymentMethod = paymentMethodsQuery.data?.paymentMethods.find(
    (pm) => pm.default,
  );
  /*
   * If we initially called dialog with `draftOrderId` then
   * we will just update existing order
   * */
  const updateOrderFn = async (): Promise<void> => {
    if (!draftOrder) {
      toast.warning('No orderId found for previous order. Contact support.');
      return;
    }

    const response = await updateOrderMutation.mutateAsync({
      orderId: draftOrder.id,
      data: {
        location: location ? location : {},
        timezone: tz || moment.tz.guess(),

        timestamp: slot ? slot.start : new Date().toISOString(),
        status: 'PENDING',
      },
    });

    if (response.order) {
      nextStep();
    }
  };

  return (
    <>
      <div className="p-6 md:p-14">
        {existingDraftOrder && (
          <Alert className="mb-12" variant="destructive">
            <TriangleAlert className="size-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You have already purchased {service.name}. To complete your
              booking, please click on the “To be Scheduled” tab.
            </AlertDescription>
          </Alert>
        )}
        <div className="md:space-y-8">
          <H2>Order Summary</H2>
          <CreateOrderSummaryItem />
        </div>
        <div
          className={cn(
            'flex flex-col gap-3 rounded-2xl border border-zinc-200 px-8 py-6 md:mt-12',
          )}
        >
          <Body2 className={cn('text-zinc-500')}>Payment method</Body2>
          <div>
            <Body1>{capitalize(defaultPaymentMethod?.card.brand ?? '')}</Body1>
            <Body1>****{defaultPaymentMethod?.card.last4}</Body1>
          </div>
        </div>
      </div>
      <div className="flex items-center px-6 pb-12 md:justify-between md:px-14">
        <Body1 className="hidden text-zinc-400 md:block">
          Step {activeStep + 1} of {steps.length}
        </Body1>
        <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={prevStep}
            disabled={isMutationLoading}
          >
            Back
          </Button>
          <Button
            onClick={draftOrder ? updateOrderFn : createOrderFn}
            className="w-full md:w-auto"
            disabled={isMutationLoading}
          >
            {isMutationLoading ? <Spinner /> : 'Confirm'}
          </Button>
        </div>
      </div>
    </>
  );
}

function CreateOrderSummaryItem(): ReactNode {
  const { service, items, slot, collectionMethod, tz } = useOrder((s) => s);

  if (service === null) throw Error('There was a problem creating the order.');

  const { data, isLoading } = useService({
    serviceId: service.id,
    method: collectionMethod,
    items,
  });

  const basePrice = data?.service.price ?? 0; // Default to 0 if undefined

  return (
    <div className="flex flex-col items-start justify-between space-y-4 py-3 sm:flex-row sm:items-center sm:space-y-0">
      <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 p-6 md:flex-row md:items-center md:border-none md:p-0">
        {isLoading ? (
          <Skeleton className="h-12 min-w-12" />
        ) : (
          <img
            src={service.image}
            alt={service.name}
            className="size-12 rounded-xl border border-zinc-200 object-cover object-center"
          />
        )}
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
          Total: <Price basePrice={basePrice} isLoading={isLoading} />
        </div>
      </div>
      <div className="hidden text-nowrap md:block">
        <Price basePrice={basePrice} isLoading={isLoading} />
      </div>
    </div>
  );
}

const Price = ({
  basePrice,
  isLoading,
}: {
  basePrice: number;
  isLoading: boolean;
}) => {
  const { draftOrder } = useOrder((s) => s);

  const draftOrderCollectionMethod = getDraftCollectionMethod(
    draftOrder?.method,
  );

  const isAtHome = draftOrder && draftOrderCollectionMethod !== 'IN_LAB';

  // TODO: move this logic to server instead
  basePrice = draftOrder ? (isAtHome ? 0 : 7900) : basePrice;

  return (
    <div className="text-primary">
      {isLoading ? (
        <Spinner size="xs" variant="primary" />
      ) : basePrice === 0 ? (
        'Included in subscription'
      ) : (
        formatMoney(basePrice)
      )}
    </div>
  );
};
