import { useNavigate } from 'react-router';

import { Head } from '@/components/seo';
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
      navigate('/');
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
      <Head title="Schedule Your Blood Draw" />
      <div className="flex min-h-dvh w-full flex-col">
        <BookingContent />
      </div>
    </>
  );
};
