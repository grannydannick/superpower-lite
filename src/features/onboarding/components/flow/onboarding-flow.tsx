import { Navigate } from '@tanstack/react-router';
import { AnimatePresence } from 'framer-motion';
import { Suspense, useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useOnboarding } from '@/features/onboarding/api/onboarding';
import { OnboardingNavigationProvider } from '@/features/onboarding/hooks/use-onboarding-navigation';
import { useOnboardingProgress } from '@/features/onboarding/stores/onboarding-progress-store';
import { useUpdateTask } from '@/features/tasks/api/update-task';
import { usePosthogFeatureFlagEnabled } from '@/hooks/use-posthog-feature-flag-enabled';
import { useUser } from '@/lib/auth';
import { FeatureFlags } from '@/lib/posthog';

import {
  buildOnboardingFacts,
  getValidOnboardingSteps,
  isOnboardingStepId,
  ONBOARDING_STEP_IDS,
  type OnboardingStepId,
} from './onboarding-step-manifest';
import { getOnboardingStepDefinition } from './onboarding-step-renderers';

const ORDERED_ONBOARDING_STEPS = Object.values(ONBOARDING_STEP_IDS);

export function getFallbackOnboardingStep(
  requestedStep: OnboardingStepId | undefined,
  validSteps: readonly OnboardingStepId[],
) {
  const firstValidStep = validSteps[0] ?? null;
  if (firstValidStep == null) {
    return null;
  }

  if (requestedStep == null) {
    return firstValidStep;
  }

  const validStepIds = new Set(validSteps);
  let requestedIndex = -1;
  for (let index = 0; index < ORDERED_ONBOARDING_STEPS.length; index += 1) {
    if (ORDERED_ONBOARDING_STEPS[index] === requestedStep) {
      requestedIndex = index;
      break;
    }
  }

  if (requestedIndex === -1) {
    return firstValidStep;
  }

  for (let index = 0; index < ORDERED_ONBOARDING_STEPS.length; index += 1) {
    const stepId = ORDERED_ONBOARDING_STEPS[index];
    if (!validStepIds.has(stepId)) {
      continue;
    }

    if (index > requestedIndex) {
      return stepId;
    }
  }

  return firstValidStep;
}

const OnboardingLoadingState = () => {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <Spinner variant="primary" />
    </div>
  );
};

const OnboardingCompletionRedirect = () => {
  const { mutateAsync: updateTaskProgress } = useUpdateTask();
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>(
    'pending',
  );

  useEffect(() => {
    let isCancelled = false;

    const completeTask = async () => {
      try {
        await updateTaskProgress({
          taskName: 'onboarding',
          data: { status: 'completed' },
        });
      } catch {
        if (isCancelled) {
          return;
        }
        setStatus('failed');
        return;
      }

      if (isCancelled) {
        return;
      }

      setStatus('completed');
    };

    void completeTask();

    return () => {
      isCancelled = true;
    };
  }, [updateTaskProgress]);

  if (status === 'completed') {
    return <Navigate to="/" replace />;
  }

  if (status === 'failed') {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center px-6 text-center text-sm text-zinc-500">
        We couldn&apos;t finish onboarding automatically. Please refresh and try
        again.
      </div>
    );
  }

  return <OnboardingLoadingState />;
};

export const OnboardingIndexRedirect = () => {
  const { data: onboardingData, isLoading } = useOnboarding();
  const { data: user } = useUser();
  const hasSeenWelcome = useOnboardingProgress(user?.id, 'hasSeenWelcome');
  const hasAnsweredHeardAboutUs = useOnboardingProgress(
    user?.id,
    'hasAnsweredHeardAboutUs',
  );
  const skipAddOnsFlow = usePosthogFeatureFlagEnabled(
    FeatureFlags.OnboardingSkipAddOnsAndScheduling,
  );

  if (isLoading || onboardingData == null) {
    return <OnboardingLoadingState />;
  }

  const validSteps = getValidOnboardingSteps({
    ...buildOnboardingFacts(onboardingData),
    hasSeenWelcome,
    hasAnsweredHeardAboutUs,
    intakeEnabled: user?.access?.intake !== false,
    skipAddOnsFlow: skipAddOnsFlow === true,
  });
  const firstStep = validSteps[0] ?? null;
  if (firstStep == null) {
    return <OnboardingCompletionRedirect />;
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
  const hasAnsweredHeardAboutUs = useOnboardingProgress(
    user?.id,
    'hasAnsweredHeardAboutUs',
  );
  const skipAddOnsFlow = usePosthogFeatureFlagEnabled(
    FeatureFlags.OnboardingSkipAddOnsAndScheduling,
  );

  const requestedStep = isOnboardingStepId(stepPath) ? stepPath : undefined;

  if (isLoading || onboardingData == null) {
    return <OnboardingLoadingState />;
  }

  const validSteps = getValidOnboardingSteps({
    ...buildOnboardingFacts(onboardingData),
    hasSeenWelcome,
    hasAnsweredHeardAboutUs,
    intakeEnabled: user?.access?.intake !== false,
    skipAddOnsFlow: skipAddOnsFlow === true,
  });
  const fallbackStep = getFallbackOnboardingStep(requestedStep, validSteps);
  if (fallbackStep == null) {
    return <OnboardingCompletionRedirect />;
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
