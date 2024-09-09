import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { steps } from '@/features/onboarding/components/steps';
import { useUser } from '@/lib/auth';
import { StepperStoreProvider, useStepper } from '@/lib/stepper';
import { cn } from '@/lib/utils';

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

  /**
   * This hack is to override default preloaded image background for steps that doesn't need it
   *
   * The default image background preload was done to avoid weird white flickering of screen
   * when image on background changes, and it takes a couple of miliseconds to display it
   *
   * bg-spine in this case acts as a fallback
   */
  const bgWgiteSteps = [
    'configurator',
    'confirm-order',
    'identity',
    'schedule',
    'booking',
    'pick-date',
    'booking-success',
    'additional-services',
    'additional-booking-success',
  ];

  return (
    <div
      className={cn(
        'bg-spine',
        bgWgiteSteps.includes(currentStep.id)
          ? 'bg-white min-h-screen w-full'
          : null,
      )}
    >
      {currentStep?.content ?? null}
    </div>
  );
};
