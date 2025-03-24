import { useEffect, useRef } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL } from '@/const';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { StepID } from '@/features/orders/types/step-id';
import { useServices } from '@/features/services/api';
import { useSubscriptions } from '@/features/settings/api';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useStepper } from '@/lib/stepper';
import { HealthcareService } from '@/types/api';

const Booking = ({ bloodPanel }: { bloodPanel?: HealthcareService }) => {
  const { activeStep, nextStep } = useStepper((s) => s);
  const ordersQuery = useOrders({});
  const { mutateAsync: updateTaskProgress, isError } = useUpdateTask();

  // ref to track if updateOrder has been called already
  const hasCheckedRef = useRef<boolean>(false);

  const updateStep = async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { progress: activeStep + 1 },
    });

    if (!isError) {
      nextStep();
    }
  };

  /**
   * The idea of this useEffect is to make sure user
   * who closed the app right after booking
   * doesn't get into weird state
   */
  useEffect(() => {
    if (!ordersQuery.data?.orders || !bloodPanel) return;

    /**
     * This is small hack to make sure we are not executing it multiple times
     * even after orders loaded
     *
     * If you remove it, make sure that you implemented
     * additional logic that prevents this from firing but still keeps behaviour
     */
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const existingOrder = ordersQuery.data.orders.find(
      (o) => o.serviceId === bloodPanel.id,
    );

    if (!existingOrder) return;

    if (existingOrder.status !== 'DRAFT') {
      updateStep();
    }
  }, [ordersQuery.data]);

  if (!bloodPanel) {
    return null;
  }

  return (
    <HealthcareServiceDialog
      healthcareService={bloodPanel}
      excludeSteps={[StepID.INFO, StepID.REFERRAL]}
      onSubmit={updateStep}
    />
  );
};

const Loader = () => {
  return (
    <div className="flex h-48 w-full items-center justify-center">
      <Spinner variant="primary" size="lg" />
    </div>
  );
};

export const BookingStep = () => {
  const servicesQuery = useServices();
  const subscriptionsQuery = useSubscriptions();

  const superpowerMembership = subscriptionsQuery.data?.subscriptions.find(
    (subscription) => subscription.name === 'membership',
  );

  const services = servicesQuery.data?.services;

  const bloodPanel = services?.find((s) =>
    superpowerMembership?.type === 'baseline'
      ? s.name === SUPERPOWER_BLOOD_PANEL
      : s.name === ADVANCED_BLOOD_PANEL,
  );

  return (
    <ImageContentLayout title="Booking" currentService={bloodPanel}>
      {servicesQuery.isLoading || subscriptionsQuery.isLoading ? (
        <Loader />
      ) : superpowerMembership?.type ? (
        <Booking bloodPanel={bloodPanel} />
      ) : (
        <div className="p-6 md:p-14">
          <Body1 className="text-pink-700">
            Failed to pull membership. Please contact support so we can help
            you!
          </Body1>
        </div>
      )}
    </ImageContentLayout>
  );
};
