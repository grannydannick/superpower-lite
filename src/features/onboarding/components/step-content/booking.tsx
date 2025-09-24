import { useEffect, useRef } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import {
  ADVANCED_BLOOD_PANEL,
  ServiceTypeEnum,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { ImageContentLayout } from '@/features/onboarding/components/layouts';
import { useOrders } from '@/features/orders/api';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { StepID } from '@/features/orders/types/step-id';
import { useServices } from '@/features/services/api';
import { useSubscriptions } from '@/features/settings/api';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { useEventDraw } from '@/hooks/use-event-draw';
import { useStepper } from '@/lib/stepper';
import { HealthcareService } from '@/types/api';

const Booking = ({ bloodPanel }: { bloodPanel?: HealthcareService }) => {
  const { activeStep, nextStep } = useStepper((s) => s);
  const ordersQuery = useOrders({});
  const { mutateAsync: updateTaskProgress, isError } = useUpdateTask();
  const { isEventDrawUser } = useEventDraw();

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

  const excludeSteps = [StepID.INFO, StepID.REFERRAL];

  // For event draw users, also exclude phlebotomy and scheduler steps
  if (isEventDrawUser) {
    excludeSteps.push(StepID.PHLEBOTOMY, StepID.SCHEDULER);
  }

  return (
    <HealthcareServiceDialog
      healthcareService={bloodPanel}
      excludeSteps={excludeSteps}
      onSubmit={updateStep}
      isBookingModal={false}
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
  const ordersQuery = useOrders();
  const subscriptionsQuery = useSubscriptions();

  const draftOrder = ordersQuery.data?.orders.find(
    (o) =>
      o.serviceId.startsWith(ServiceTypeEnum.Baseline) ||
      o.serviceId.startsWith(ServiceTypeEnum.Advanced),
  );
  const services = servicesQuery.data?.services;

  const bloodPanel = services?.find((s) =>
    draftOrder?.serviceId.startsWith(ServiceTypeEnum.Baseline)
      ? s.name === SUPERPOWER_BLOOD_PANEL
      : s.name === ADVANCED_BLOOD_PANEL,
  );

  return (
    <ImageContentLayout title="Booking" currentService={bloodPanel}>
      {servicesQuery.isLoading || subscriptionsQuery.isLoading ? (
        <Loader />
      ) : bloodPanel ? (
        <Booking bloodPanel={bloodPanel} />
      ) : (
        <div className="p-6 md:p-14">
          <Body1 className="text-pink-700">
            Failed to pull your credit. Please contact support so we can help
            you!
          </Body1>
        </div>
      )}
    </ImageContentLayout>
  );
};
