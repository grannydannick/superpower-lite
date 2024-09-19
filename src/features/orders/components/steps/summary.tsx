import moment from 'moment';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useCreateOrder, useUpdateOrder } from '@/features/orders/api';
import { useOrder } from '@/features/orders/stores/order-store';
import { useService } from '@/features/services/api';
import { usePaymentMethods } from '@/features/settings/api';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/types/api';
import { capitalize } from '@/utils/format';
import { formatMoney } from '@/utils/format-money';

export function OrderSummary(): JSX.Element {
  const {
    service,
    items,
    location,
    slot,
    collectionMethod,
    tz,
    draftOrderId,
    updateCreatedOrderId,
  } = useOrder((s) => s);
  const { activeStep, nextStep, steps, prevStep } = useStepper((s) => s);
  const paymentMethodsQuery = usePaymentMethods();

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const isMutationLoading =
    createOrderMutation.isPending || updateOrderMutation.isPending;

  /*
   * If user books new service (draftOrderId was not initialized)
   *
   * we just create regular order
   * */
  const createOrderFn = async (): Promise<void> => {
    if (service === null)
      throw Error('There was a problem creating the order.');

    const response = await createOrderMutation.mutateAsync({
      data: {
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
      },
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
    const response = await updateOrderMutation.mutateAsync({
      orderId: draftOrderId as string,
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
            onClick={draftOrderId ? updateOrderFn : createOrderFn}
            className="w-full md:w-auto"
          >
            {isMutationLoading ? <Spinner /> : 'Confirm'}
          </Button>
        </div>
      </div>
    </>
  );
}

function CreateOrderSummaryItem(): JSX.Element {
  const { service, items, slot, collectionMethod, tz } = useOrder((s) => s);

  if (service === null) throw Error('There was a problem creating the order.');

  const { data, isLoading } = useService({
    serviceId: service.id,
    method: collectionMethod,
    items,
  });

  const code = window.localStorage.getItem('superpower-code');

  const basePrice = code === 'SPPROMO' ? 0 : data?.service.price ?? 0; // Default to 0 if undefined

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
          <p className="text-primary">{service.name}</p>
          <p className="space-x-2 text-sm text-zinc-500">
            {service.phlebotomy && (
              <>
                <span>
                  {collectionMethod === 'IN_LAB'
                    ? 'In-lab visit'
                    : 'At-home visit'}
                </span>
                <span>-</span>
              </>
            )}
            {slot && (
              <span>
                {moment(slot.start).tz(tz).format('MMMM Do, h:mma')}
                {'-'}
                {moment(slot.end).tz(tz).format('h:mma z')}
              </span>
            )}
          </p>
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
  const { draftOrderId } = useOrder((s) => s);

  return (
    <div className="text-primary">
      {isLoading ? (
        <Spinner size="xs" variant="primary" />
      ) : basePrice === 0 || draftOrderId ? (
        'Included in subscription'
      ) : (
        formatMoney(basePrice)
      )}
    </div>
  );
};
