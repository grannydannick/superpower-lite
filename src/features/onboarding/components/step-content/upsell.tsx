import moment from 'moment';
import 'moment-timezone';
import React, { useState } from 'react';

import { HealthcareServiceInfoDialog } from '@/components/shared/healthcare-service-info-dialog-content';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  TOTAL_TOXIN_TEST,
} from '@/const';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { CreateOrderInput } from '@/features/orders/api';
import { useCreateBulkOrders } from '@/features/orders/api/create-bulk-orders';
import { getDefaultCollectionMethod } from '@/features/orders/utils/get-default-collection-method';
import { useService, useServices } from '@/features/services/api';
import { CurrentPaymentMethodCard } from '@/features/users/components/current-payment-method-card';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
import { HealthcareService, OrderStatus } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

const UPSELL_SERVICES = [
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  TOTAL_TOXIN_TEST,
];

const UpsellServiceCard = ({
  service,
  checked,
  updateUpsells,
}: {
  service: HealthcareService;
  checked: boolean;
  updateUpsells: (service: HealthcareService) => void;
}) => {
  const serviceQuery = useService({
    serviceId: service.id,
    method: service.name === GRAIL_GALLERI_MULTI_CANCER_TEST ? 'AT_HOME' : null,
  });

  if (!serviceQuery.data) {
    return;
  }

  return (
    <div
      className={cn(
        'flex items-center rounded-3xl border border-zinc-200 py-5 px-6 hover:bg-zinc-50 cursor-pointer',
        checked ? 'bg-zinc-50' : '',
      )}
    >
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <div className="flex max-w-[300px] flex-row gap-x-4">
          <img
            src={service.image}
            alt={service.name}
            className="size-16 rounded-xl object-cover"
          />
          <div className="flex flex-col gap-1">
            <Body1 className="line-clamp-1 text-zinc-500">{service.name}</Body1>
            <Body2 className="line-clamp-2 text-[#A5A5AE]">
              {service.description}
            </Body2>

            <HealthcareServiceInfoDialog
              healthcareService={serviceQuery.data.service}
              openBtn={
                <Body2
                  className="max-w-fit text-sm leading-5 text-vermillion-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  More info
                </Body2>
              }
              closeBtn={
                <Button
                  onClick={() => updateUpsells(serviceQuery.data.service)}
                >
                  {checked ? 'Remove from cart' : 'Add to cart'}
                </Button>
              }
            />
          </div>
        </div>
        <div className="flex flex-row items-center gap-x-2 sm:gap-x-6">
          <Body2 className="text-nowrap text-zinc-500">
            {serviceQuery.isLoading ? (
              <Skeleton className="h-5 w-10" />
            ) : (
              `+ ${formatMoney(serviceQuery.data.service.price)}`
            )}
          </Body2>

          <Checkbox
            checked={checked}
            onCheckedChange={() => updateUpsells(serviceQuery.data.service)}
            onClick={(e) => e.stopPropagation()} // Stops the event from bubbling up
            className="size-5 border-zinc-200"
          />
        </div>
      </div>
    </div>
  );
};

const Upsell = () => {
  const { data: user } = useUser();
  const { data, isLoading } = useServices();
  const [upsells, setUpsells] = useState<HealthcareService[]>([]);
  const [checkout, setCheckout] = useState(false);

  const jumpOnboarding = useStepper((s) => s.jumpOnboarding);

  const updateUpsells = (service: HealthcareService) => {
    setUpsells((prev) => {
      const exists = prev.find((s) => s.id === service.id);

      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const availableServices =
    data?.services
      .filter((s) => UPSELL_SERVICES.includes(s.name))
      .filter((s) => s.active) ?? [];

  if (checkout) {
    return (
      <UpsellCheckout
        services={upsells}
        setCheckout={(status) => setCheckout(status)}
      />
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-14">
      <div className="space-y-4">
        <H2>Additional services</H2>
        <Body1 className="text-zinc-500">
          Get an even more comprehensive view of your health.
        </Body1>
        <Body1 className="text-zinc-500">
          If you add these items now, we will bundle a free review with an
          expert longevity clinician.
        </Body1>
      </div>
      <div className="space-y-2">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-[134px] w-full" />
                </div>
              ))
          : null}
        {availableServices.map((s) => (
          <UpsellServiceCard
            key={s.id}
            service={s}
            checked={!!upsells.find((u) => u.id === s.id)}
            updateUpsells={updateUpsells}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 py-10">
        <Button
          variant="outline"
          onClick={() =>
            user ? jumpOnboarding('mission', user.onboarding.id) : undefined
          }
        >
          No thanks
        </Button>
        <Button disabled={!upsells.length} onClick={() => setCheckout(true)}>
          Add services
        </Button>
      </div>
    </div>
  );
};

const UpsellCheckout = ({
  services,
  setCheckout,
}: {
  services: HealthcareService[];
  setCheckout: (status: boolean) => void;
}) => {
  const { data: user } = useUser();
  const { mutateAsync, isPending, error } = useCreateBulkOrders();
  const nextOnboardingStep = useStepper((s) => s.nextOnboardingStep);

  const createBulkOrdersFromServices = async () => {
    if (!user) return;
    const orders: CreateOrderInput[] = [];
    for (const service of services) {
      const collectionMethod = getDefaultCollectionMethod(service);

      const data: CreateOrderInput = {
        serviceId: service.id,
        location: {},
        timestamp: new Date().toISOString(),
        timezone: moment.tz.guess(),
        method: collectionMethod ? [collectionMethod] : [],
        status: OrderStatus.draft,
      };

      orders.push(data);
    }

    await mutateAsync({ data: orders });
    await nextOnboardingStep(user.onboarding.id);
  };
  return (
    <div className="space-y-4 p-6 md:p-14">
      <H2>Order Summary</H2>
      <div className="space-y-2">
        {services.map((s) => (
          <div
            className="flex w-full items-center justify-between rounded-3xl bg-zinc-100 p-4"
            key={s.id}
          >
            <div className="flex items-center gap-4">
              <img
                src={s.image}
                alt={s.name}
                className="size-12 rounded-xl object-cover"
              />
              <Body1>{s.name}</Body1>
            </div>
            <Body1>{formatMoney(s.price)}</Body1>
          </div>
        ))}
      </div>
      <CurrentPaymentMethodCard
        error={
          error
            ? 'There was an issue with your payment method. Please try again'
            : undefined
        }
      />
      <div className="flex items-center justify-end gap-2 py-10">
        <Button
          variant="outline"
          onClick={() => setCheckout(false)}
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          onClick={createBulkOrdersFromServices}
          disabled={isPending || !!error}
        >
          {isPending ? (
            <TextShimmer
              className="line-clamp-1 text-base [--base-color:white] [--base-gradient-color:#a1a1aa]"
              duration={1}
            >
              Confirming…
            </TextShimmer>
          ) : (
            'Confirm'
          )}
        </Button>
      </div>
    </div>
  );
};

export const UpsellStep = () => (
  <ImageContentLayout title="Booking">
    <Upsell />
  </ImageContentLayout>
);
