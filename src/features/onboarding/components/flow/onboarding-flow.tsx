import { Navigate } from '@tanstack/react-router';
import { AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useOnboarding } from '@/features/onboarding/api/onboarding';
import { OnboardingNavigationProvider } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { useOnboardingProgress } from '@/features/onboarding/stores/onboarding-progress-store';
import { useUser } from '@/lib/auth';

import {
  buildOnboardingFacts,
  getValidOnboardingSteps,
  isOnboardingStepId,
} from './onboarding-step-manifest';
import { getOnboardingStepDefinition } from './onboarding-step-renderers';

const OnboardingLoadingState = () => {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <Spinner variant="primary" />
    </div>
  );
};

export const OnboardingIndexRedirect = () => {
  const { data: onboardingData, isLoading } = useOnboarding();
  const { data: user } = useUser();
  const hasSeenWelcome = useOnboardingProgress(user?.id, 'hasSeenWelcome');
  const hasSeenGiftUpsell = useOnboardingProgress(
    user?.id,
    'hasSeenGiftUpsell',
  );
  const hasAnsweredHeardAboutUs = useOnboardingProgress(
    user?.id,
    'hasAnsweredHeardAboutUs',
  );

  if (isLoading || onboardingData == null) {
    return <OnboardingLoadingState />;
  }

  const validSteps = getValidOnboardingSteps({
    ...buildOnboardingFacts(onboardingData),
    hasSeenWelcome,
    hasSeenGiftUpsell,
    hasAnsweredHeardAboutUs,
  });
  const firstStep = validSteps[0] ?? null;
  if (firstStep == null) {
    throw new Error('Unable to resolve the current onboarding step.');
  }

  return (
    <Navigate to="/onboarding/$step" params={{ step: firstStep }} replace />
  );
};

interface OnboardingFlowProps {
  stepPath: string | undefined;
}

export const OnboardingFlow = ({ stepPath }: OnboardingFlowProps) => {
  const { data: onboardingData, isLoading } = useOnboarding();
  const { data: user } = useUser();
  const hasSeenWelcome = useOnboardingProgress(user?.id, 'hasSeenWelcome');
  const hasSeenGiftUpsell = useOnboardingProgress(
    user?.id,
    'hasSeenGiftUpsell',
  );
  const hasAnsweredHeardAboutUs = useOnboardingProgress(
    user?.id,
    'hasAnsweredHeardAboutUs',
  );

  const requestedStep = isOnboardingStepId(stepPath) ? stepPath : undefined;

  if (isLoading || onboardingData == null) {
    return <OnboardingLoadingState />;
  }

  const validSteps = getValidOnboardingSteps({
    ...buildOnboardingFacts(onboardingData),
    hasSeenWelcome,
    hasSeenGiftUpsell,
    hasAnsweredHeardAboutUs,
  });
  const fallbackStep = validSteps[0] ?? null;
  if (fallbackStep == null) {
    throw new Error('Unable to resolve a valid onboarding step.');
  }

  if (requestedStep == null || !validSteps.includes(requestedStep)) {
    return (
      <Navigate
        to="/onboarding/$step"
        params={{ step: fallbackStep }}
        replace
      />
    );
  }

  const stepDefinition = getOnboardingStepDefinition(requestedStep);
  if (stepDefinition == null) {
    throw new Error(`Unknown onboarding step: ${requestedStep}`);
  }

  return (
    <OnboardingNavigationProvider
      currentStep={requestedStep}
      validSteps={validSteps}
    >
      <AnimatePresence mode="wait">
        <div key={requestedStep} className="flex min-h-dvh flex-col">
          <Suspense fallback={<OnboardingLoadingState />}>
            {stepDefinition.render()}
          </Suspense>
        </div>
      </AnimatePresence>
    </OnboardingNavigationProvider>
  );
};
