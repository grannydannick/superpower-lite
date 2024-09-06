import moment from 'moment';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useStepper } from '@/components/ui/stepper';
import { Body1 } from '@/components/ui/typography';
import { useCreateOrder } from '@/features/orders/api/create-order';
import { useOrder } from '@/features/orders/stores/order-store';
import { useService } from '@/features/services/api/get-service';
import { OrderStatus } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

export function OrderSummary(): JSX.Element {
  const {
    service,
    items,
    location,
    slot,
    collectionMethod,
    tz,
    updateCreatedOrderId,
  } = useOrder((s) => s);
  const { activeStep, nextStep, steps, prevStep } = useStepper((s) => s);

  const createOrderMutation = useCreateOrder();

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

  return (
    <>
      <div className="space-y-16">
        <div className="space-y-4">
          <h3 className="text-3xl">Booking Summary</h3>
          <CreateOrderSummaryItem />
        </div>
      </div>
      <div className="flex items-center justify-between pt-12">
        <Body1 className="text-zinc-400">
          Step {activeStep + 1} of {steps.length}
        </Body1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={createOrderMutation.isPending}
          >
            Back
          </Button>
          <Button onClick={createOrderFn}>
            {createOrderMutation.isPending ? <Spinner /> : 'Confirm'}
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
      <div className="flex flex-row items-center space-x-4">
        <img
          src={service.image}
          alt={service.name}
          className="size-12 rounded-xl border border-zinc-200 object-cover object-center"
        />
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
      </div>
      <div>
        <div className="text-primary">
          {isLoading ? (
            <Spinner size="xs" />
          ) : basePrice === 0 ? (
            'Included in subscription'
          ) : (
            formatMoney(basePrice)
          )}
        </div>
      </div>
    </div>
  );
}
