import moment from 'moment';

import { Button } from '@/components/ui/button';
import { Scheduler } from '@/components/ui/scheduler';
import { Spinner } from '@/components/ui/spinner';
import { useStepper } from '@/components/ui/stepper';
import { Body1, H2 } from '@/components/ui/typography';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { useUpdateOrder } from '@/features/orders/api/update-order';
import { useServices } from '@/features/services/api/get-services';

export const PickDate = () => {
  const { nextOnboardingStep, prevStep } = useStepper((s) => s);
  const { data, isLoading } = useServices({});
  const {
    updateBloodSlot,
    slots,
    collectionMethod,
    serviceAddress,
    updateBloodTimezone,
  } = useOnboarding();

  const updateOrderMutation = useUpdateOrder({});
  const superpowerBloodPanel = data?.services.find(
    (s) => s.name === 'Superpower Blood Panel',
  );

  const allowOrder = slots.blood.orderId && superpowerBloodPanel?.id;

  // double check we have all of that before showing scheduler
  const allowSchedulerRender =
    serviceAddress?.address && superpowerBloodPanel?.id && collectionMethod;

  const updateBloodOrder = async () => {
    if (!allowOrder) return;

    await updateOrderMutation.mutateAsync({
      orderId: slots.blood.orderId as string,
      data: {
        location: { address: serviceAddress?.address },
        timezone: slots.blood.timezone ?? moment.tz.guess(),
        timestamp: slots.blood.slot
          ? slots.blood.slot.start
          : new Date().toISOString(),
        status: 'PENDING',
      },
    });

    await nextOnboardingStep();
  };

  return (
    <section id="main">
      <div className="space-y-1">
        <H2 className="text-zinc-900">Pick a time for your lab draw</H2>
        <Body1 className="text-[#71717A]">
          An appointment takes 15 minutes, your nurse will arrive during the
          selected time slot. We recommend booking with 2 hours of waking up to
          ensure the most accurate measurement of blood hormone levels
        </Body1>
      </div>
      {allowSchedulerRender ? (
        <Scheduler
          collectionMethod={collectionMethod}
          address={serviceAddress?.address}
          serviceId={superpowerBloodPanel?.id}
          onSlotUpdate={(slot, tz) => {
            updateBloodSlot(slot);
            updateBloodTimezone(tz);
          }}
          className="max-w-none py-6"
          showCreateBtn={false}
        />
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" variant="primary" />
        </div>
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
          onClick={prevStep}
          disabled={updateOrderMutation.isPending}
        >
          Back
        </Button>
        <Button
          onClick={updateBloodOrder}
          disabled={!slots.blood.slot || !allowOrder}
        >
          {updateOrderMutation.isPending ? <Spinner /> : 'Confirm appointment'}
        </Button>
      </div>
    </section>
  );
};

export const PickDateStep = () => (
  <ImageContentLayout title="Pick date" className="bg-female-stretching">
    <PickDate />
  </ImageContentLayout>
);
