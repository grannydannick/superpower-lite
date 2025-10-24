import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';
import { Body1 } from '@/components/ui/typography';
import {
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { useGroupedOrders } from '@/features/orders/hooks/use-grouped-orders';
import { BookingStepID } from '@/features/orders/utils/get-steps-for-service';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { HealthcareService } from '@/types/api';

import { useOnboardingStepper } from './onboarding-stepper';

const BookingContent = ({ bloodPanel }: { bloodPanel?: HealthcareService }) => {
  const { next } = useOnboardingStepper();

  if (!bloodPanel) {
    return null;
  }

  const excludeSteps = [BookingStepID.INFO];

  if (bloodPanel.name === CUSTOM_BLOOD_PANEL) {
    excludeSteps.push(BookingStepID.PANELS);
  }

  return (
    <HealthcareServiceDialog
      healthcareService={bloodPanel}
      excludeSteps={excludeSteps}
      // let user manually click next step inside the onboarding
      onClose={next}
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

export const PhlebotomyBookingStep = () => {
  const { mutateAsync: updateTaskProgress } = useUpdateTask();
  const { buckets, groupedOrdersLoading } = useGroupedOrders();
  const navigate = useNavigate();
  // this is going to be replaced in custom panels v1 but right now we need to assume
  // that there can be 3 credits:
  // 1. regular baseline with membership
  // 2. advanced upgraded credit
  // 3. add on upgraded credit
  const draftOrder = buckets.drafts.find((d) =>
    [ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL, CUSTOM_BLOOD_PANEL].includes(
      d.order.serviceName,
    ),
  );

  // If a user doesn't fully complete onboarding, they will have an upcoming order
  // 1. We use this to determine if the user has completed booking and has returned to onboarding
  // 2. If so, we complete the onboarding task and navigate to the home page
  const scheduledOrder = buckets.upcoming.find((a) =>
    [ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL, CUSTOM_BLOOD_PANEL].includes(
      a.order.serviceName,
    ),
  );

  // TODO: this is temp hack
  // reason we need it is after we complete booking we no longer have draft order
  // therefore cache gets refreshed and we no longer can find draft credit / service
  // this makes sure we "freeze" initial service until we leave the page
  const stableService = useStableById(draftOrder?.service);

  // If the user has a scheduled order, but no draft order, we complete the onboarding task and navigate to the home page
  useEffect(() => {
    const completeTask = async () => {
      await updateTaskProgress({
        taskName: 'onboarding',
        data: { status: 'completed' },
      });
    };

    if (!stableService && scheduledOrder) {
      completeTask();
      navigate('/');
    }
  }, [navigate, scheduledOrder, stableService, updateTaskProgress]);

  return (
    <div className="flex min-h-dvh w-full flex-col">
      {/*<FloatingLogDebug debugInfo={{ draftOrder, stableService }} />*/}
      {groupedOrdersLoading ? (
        <Loader />
      ) : stableService ? (
        <BookingContent bloodPanel={stableService} />
      ) : (
        <div className="p-6 md:p-14">
          <Body1 className="text-pink-700">
            Failed to pull your credit. Please contact support so we can help
            you!
          </Body1>
        </div>
      )}
    </div>
  );
};

// Note: there is no need to move this into helper since its temporary HACK
// until someone figures out better strategy
function useStableById<T extends { id?: string } | undefined>(value: T): T {
  const ref = useRef<T>(value);
  const prevId = (ref.current as any)?.id;
  const nextId = (value as any)?.id;

  // Update the ref only when the identity changes (id differs).
  if (nextId && nextId !== prevId) {
    ref.current = value;
  }
  // If nextId is undefined, keep the last non-undefined value to avoid drop.
  return ref.current;
}
