import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';
import { steps } from '@/features/onboarding/components/steps';
import { useTask } from '@/features/tasks/api/get-task';
import { StepperStoreProvider, useStepper } from '@/lib/stepper';
import { preloadImage } from '@/utils/preload-image';

export const onboardingLoader = () => async () => {
  /**
   * This hack is to "preload" all of the images used in onboarding
   *
   * If we are not using this, images are loaded dynamically and create weird "flicker" effect
   * which this loader hopefully should fix
   *
   */
  const preloadedImages = [
    '/onboarding/bg-female-face.webp',
    '/onboarding/bg-male.webp',
    '/onboarding/bg-spine.webp',
    '/onboarding/bg-female-hands.webp',
  ];

  const imagesPromiseList: Promise<any>[] = [];
  for (const i of preloadedImages) {
    imagesPromiseList.push(preloadImage(i));
  }

  return Promise.all(imagesPromiseList);
};

export const OnboardingRoute = () => {
  const onboardingTask = useTask({
    taskName: 'onboarding',
  });

  const navigate = useNavigate();

  /**
   * This gets triggered on final step or if user already has onboarding completed
   */
  useEffect(() => {
    if (!onboardingTask.data) return;

    if (onboardingTask.data.task.status === 'completed') {
      navigate('/', {
        replace: true,
      });
    }
  }, [onboardingTask.data, navigate]);

  if (onboardingTask.isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Spinner variant="primary" size="lg" />
      </div>
    );
  }

  if (!onboardingTask.data) {
    return null;
  }

  const initialStep = onboardingTask.data.task.progress ?? 0;

  return (
    <AnimatePresence>
      <StepperStoreProvider steps={steps} initialStep={initialStep}>
        <Step />
      </StepperStoreProvider>
    </AnimatePresence>
  );
};

const Step = () => {
  const { steps, activeStep } = useStepper((s) => s);

  const currentStep = steps[activeStep];

  return currentStep?.content ?? null;
};
