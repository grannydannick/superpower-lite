import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ScheduleFlow } from '@/features/orders/components/schedule/schedule-flow';
import { useUpdateTask } from '@/features/tasks/api/update-task';

import { useOnboardingStepper } from './onboarding-stepper';

const BookingContent = () => {
  const navigate = useNavigate();
  const { next, isLastStep } = useOnboardingStepper();
  const { mutateAsync: updateTaskProgress } = useUpdateTask();

  const isLastStepRef = useRef(isLastStep);
  isLastStepRef.current = isLastStep;

  const handleSuccess = async () => {
    if (isLastStepRef.current) {
      await updateTaskProgress({
        taskName: 'onboarding',
        data: { status: 'completed' },
      });
    }
  };

  const handleDone = () => {
    if (isLastStepRef.current) {
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
    <div className="flex min-h-dvh w-full flex-col">
      <BookingContent />
    </div>
  );
};
