import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Scheduler } from '@/components/shared/scheduler';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  TOTAL_TOXIN_TEST,
} from '@/const';
import { AddAddressForm } from '@/features/onboarding/components/add-address-form';
import { AdditionalServiceCard } from '@/features/onboarding/components/additional-service-card';
import { EditAddressForm } from '@/features/onboarding/components/edit-address-form';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { getOrderInfo } from '@/features/onboarding/utils/get-order-info';
import { useUpdateOrder } from '@/features/orders/api/update-order';
import { AddressSelect } from '@/features/users/components/address-select';
import { CurrentAddressCard } from '@/features/users/components/current-address-card';
import { useUser } from '@/lib/auth';
import { useStepper } from '@/lib/stepper';
import { HealthcareService, OrderStatus, Slot } from '@/types/api';

const ServiceCard = ({ service }: { service: HealthcareService }) => {
  return (
    <div className="flex gap-4 rounded-xl border border-zinc-200 p-4">
      <img
        className="size-[56px] rounded-lg object-cover"
        src={service.image}
        alt="service"
      />
      <div className="flex flex-col justify-center gap-1">
        <Body1 className="text-zinc-900">{service.name}</Body1>
        <Body2 className="line-clamp-1 text-zinc-500">
          {service.description}
        </Body2>
      </div>
    </div>
  );
};

const SchedulerCase = ({
  service,
  setIndex,
}: {
  service: HealthcareService;
  setIndex: Dispatch<SetStateAction<number>>;
}) => {
  const {
    updateCancerSlot,
    serviceAddress,
    collectionMethod,
    updateCancerTimezone,
  } = useOnboarding();
  const [slot, setSlot] = useState<Slot | null>();
  const { prevStep } = useStepper((s) => s);

  const onSelect = (slot: Slot | null, timezone: string) => {
    if (service.name === GRAIL_GALLERI_MULTI_CANCER_TEST) {
      setSlot(slot);
      updateCancerSlot(slot);
      updateCancerTimezone(timezone);
    }
  };

  // double check we have all of that before showing scheduler
  const allowSchedulerRender = serviceAddress?.address && collectionMethod;

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <H2 className="text-zinc-900">Schedule additional services</H2>
          <Body2 className="text-zinc-500">
            Schedule your upcoming bookings. <br /> We’ll send you a reminder
            when your booking is coming up.
          </Body2>
        </div>
        <ServiceCard service={service} />
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="p-0 text-zinc-500"
            onClick={() => {
              setIndex((prev) => prev + 1);
              service.name === GRAIL_GALLERI_MULTI_CANCER_TEST &&
                updateCancerSlot(null);
            }}
          >
            Skip this for now
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <H2 className="text-zinc-900">Pick a time for at-home visit</H2>
        <Body1 className="text-zinc-500">
          An appointment takes 15 minutes, your nurse will arrive during the
          selected time slot. We recommend booking with 2 hours of waking up to
          ensure the most accurate measurement of blood hormone levels
        </Body1>
      </div>
      {allowSchedulerRender ? (
        <Scheduler
          serviceId={service.id}
          address={serviceAddress?.address}
          collectionMethod={collectionMethod}
          onSlotUpdate={onSelect}
          displayCancellationNote
          showCreateBtn={false}
          className="max-w-none py-6"
        />
      ) : (
        <div className="flex justify-center py-10">
          <Body1 className="text-[#B90090]">
            Cannot load service scheduler. Contact support.
          </Body1>
        </div>
      )}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() =>
            setIndex((prev) => {
              if (prev !== 0) {
                return prev - 1;
              }
              // If prev is 0, get back to previous step
              prevStep();
              return prev;
            })
          }
        >
          Back
        </Button>
        <Button
          disabled={!slot}
          onClick={() => slot && setIndex((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </>
  );
};

const ConfirmAddressCase = ({
  service,
  setIndex,
}: {
  service: HealthcareService;
  setIndex: Dispatch<SetStateAction<number>>;
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const { updateToxinAddress, updateMicrobiomeAddress } = useOnboarding();
  const { prevStep } = useStepper((s) => s);
  const { data: user } = useUser();

  const next = () => {
    if (!user?.primaryAddress) {
      toast.warning('No primary address added.');
      return;
    }

    service.name === TOTAL_TOXIN_TEST &&
      updateToxinAddress(user?.primaryAddress);
    service.name === GUT_MICROBIOME_ANALYSIS &&
      updateMicrobiomeAddress(user?.primaryAddress);
    setIndex((prev) => prev + 1);
  };

  if (isEditingAddress) {
    return (
      <div className="space-y-8">
        <H2 className="text-zinc-900">Edit your address</H2>
        <CurrentAddressCard />
        <EditAddressForm
          setIsEditing={() => setIsEditingAddress((prev) => !prev)}
        />
      </div>
    );
  }

  if (isAddingAddress) {
    return (
      <div className="space-y-8">
        <H2 className="text-zinc-900">Add your address</H2>
        <AddAddressForm
          setIsAdding={() => setIsAddingAddress((prev) => !prev)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <H2 className="text-zinc-900">Your items are on their way</H2>
          <Body2 className="text-zinc-500">
            Your additional tests should arrive in 2-3 business days.
          </Body2>
        </div>
        <ServiceCard service={service} />
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="p-0 text-zinc-500"
            onClick={() => {
              service.name === TOTAL_TOXIN_TEST && updateToxinAddress(null);
              setIndex((prev) => prev + 1);
            }}
          >
            Skip this for now
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <H2 className="text-zinc-900">Place of service</H2>
        <div className="space-y-2">
          <Body2 className="text-zinc-500">Confirm your shipping address</Body2>
          <AddressSelect
            onAddressAdd={() => setIsAddingAddress((prev) => !prev)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() =>
            setIndex((prev) => {
              if (prev !== 0) {
                return prev - 1;
              }

              // If prev is 0, get back to previous step
              prevStep();
              return prev;
            })
          }
        >
          Back
        </Button>
        <Button onClick={next}>Next</Button>
      </div>
    </>
  );
};

const OrderSummaryCase = ({
  setIndex,
}: {
  setIndex: Dispatch<SetStateAction<number>>;
}) => {
  const updateOrderMutation = useUpdateOrder({});
  const { jumpOnboarding, nextOnboardingStep, updatingStep } = useStepper(
    (s) => s,
  );
  const { additionalServices, slots } = useOnboarding();

  // filter out all services that user skipped
  const filteredServices = additionalServices.filter((as) => {
    const orderInfo = getOrderInfo(as, slots);
    return orderInfo && (orderInfo.timestamp || orderInfo.address);
  });

  useEffect(() => {
    if (filteredServices.length === 0) {
      // skip this step if no services were purchased
      jumpOnboarding('digital-twin');
    }
  }, [filteredServices.length, jumpOnboarding]); // Add dependencies to avoid unnecessary re-renders

  const updateBloodOrders = async () => {
    for (const as of filteredServices) {
      const orderInfo = getOrderInfo(as, slots);

      await updateOrderMutation.mutateAsync({
        orderId: orderInfo?.orderId as string,
        data: {
          location: orderInfo?.address?.address
            ? { address: orderInfo?.address?.address }
            : undefined,
          timezone: orderInfo?.timezone as string,

          timestamp: orderInfo?.timestamp
            ? orderInfo.timestamp
            : new Date().toISOString(),
          status: OrderStatus.pending,
        },
      });
    }

    await nextOnboardingStep();
  };

  return (
    <>
      <div className="space-y-4">
        <H2 className="text-zinc-900">Order summary</H2>
        <Body1 className="text-zinc-500">
          Review your additional order details below. Make changes or select
          confirm to complete your bookings.
        </Body1>
        {filteredServices.map((service, index) => (
          <AdditionalServiceCard
            service={service}
            onEdit={() => setIndex((prev) => prev - 1)}
            key={index}
          />
        ))}
      </div>
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          disabled={updateOrderMutation.isPending}
          onClick={() => setIndex((prev) => prev - 1)}
        >
          Back
        </Button>
        <Button
          onClick={updateBloodOrders}
          disabled={
            updateOrderMutation.isPending ||
            updateOrderMutation.isError ||
            updatingStep
          }
        >
          {updateOrderMutation.isError ? (
            'Failed to create appointment'
          ) : updateOrderMutation.isPending ? (
            <Spinner />
          ) : (
            'Confirm appointment'
          )}
        </Button>
      </div>
    </>
  );
};

export const AdditionalServices = () => {
  const { additionalServices } = useOnboarding();
  const jumpOnboarding = useStepper((s) => s.jumpOnboarding);

  const [curIndex, setCurIndex] = useState(0);

  useEffect(() => {
    if (additionalServices.length === 0) {
      // skip this step if no services were purchased
      jumpOnboarding('digital-twin');
    }
  }, [additionalServices.length, jumpOnboarding]); // Add dependencies

  const renderStep = (service: HealthcareService) => {
    switch (service.name) {
      case GRAIL_GALLERI_MULTI_CANCER_TEST:
        return <SchedulerCase service={service} setIndex={setCurIndex} />;
      case TOTAL_TOXIN_TEST:
      case GUT_MICROBIOME_ANALYSIS:
        return <ConfirmAddressCase service={service} setIndex={setCurIndex} />;
      default:
        return null;
    }
  };

  return (
    <section id="main" className="space-y-12">
      {additionalServices.map(
        (service, index) => index === curIndex && renderStep(service),
      )}
      {curIndex === additionalServices.length ? (
        <OrderSummaryCase setIndex={setCurIndex} />
      ) : null}
    </section>
  );
};

export const AdditionalServicesStep = () => (
  <ImageContentLayout title="Additional Services" className="bg-hand-pillow">
    <AdditionalServices />
  </ImageContentLayout>
);
