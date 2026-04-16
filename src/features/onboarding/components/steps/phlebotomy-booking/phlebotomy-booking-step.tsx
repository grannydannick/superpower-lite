import { useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo';
import {
  getOnboardingStepTitle,
  ONBOARDING_STEP_IDS,
} from '@/features/onboarding/components/flow/onboarding-step-manifest';
import { ScheduleFlow } from '@/features/orders/components/schedule/schedule-flow';
import { useUpdateTask } from '@/features/tasks/api/update-task';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';

const BookingContent = () => {
  const navigate = useNavigate();
  const { next, isLastStep } = useOnboardingNavigation();
  const { mutateAsync: updateTaskProgress } = useUpdateTask();

  const handleSuccess = async () => {
    await updateTaskProgress({
      taskName: 'onboarding',
      data: { status: 'completed' },
    });
  };

  const handleDone = () => {
    if (isLastStep) {
      void navigate({ to: '/' });
    } else {
      next();
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <ScheduleFlow
        onSuccess={handleSuccess}
        onDone={handleDone}
        mode="phlebotomy"
      />
    </div>
  );
};

export const PhlebotomyBookingStep = () => {
  return (
    <>
      <Head
        title={getOnboardingStepTitle(ONBOARDING_STEP_IDS.PHLEBOTOMY_BOOKING)}
      />
      <div className="flex min-h-dvh w-full flex-col">
        <BookingContent />
      </div>
    </>
  );
};
