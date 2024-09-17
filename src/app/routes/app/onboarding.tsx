import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { steps } from '@/features/onboarding/components/steps';
import { useUser } from '@/lib/auth';
import { StepperStoreProvider, useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';
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
    '/onboarding/bg-female-hands.webp',
    '/onboarding/bg-female-looking-up.webp',
    '/onboarding/bg-female-spine.webp',
    '/onboarding/bg-female-spotlight.webp',
    '/onboarding/bg-female-stretching.webp',
    '/onboarding/bg-male.webp',
    '/onboarding/bg-male-large.webp',
    '/onboarding/bg-spine.webp',
    '/onboarding/bg-spine-2.webp',
    '/onboarding/bg-watch.webp',
  ];

  const imagesPromiseList: Promise<any>[] = [];
  for (const i of preloadedImages) {
    imagesPromiseList.push(preloadImage(i));
  }

  return Promise.all(imagesPromiseList);
};

export const OnboardingRoute = () => {
  const { data: user } = useUser({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (!user?.onboarding) {
      navigate('/', {
        replace: true,
      });
    }
  }, [user?.onboarding]);

  return (
    <AnimatePresence>
      <StepperStoreProvider
        steps={steps}
        initialStep={user?.onboarding?.progress}
      >
        <Step />
      </StepperStoreProvider>
      ,
    </AnimatePresence>
  );
};

const Step = () => {
  const { steps, activeStep } = useStepper((s) => s);

  const currentStep = steps[activeStep];

  return (
    <div className={cn('bg-white min-h-screen w-full')}>
      {currentStep?.content ?? null}
    </div>
  );
};
