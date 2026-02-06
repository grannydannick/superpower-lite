import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useAnalytics } from '@/hooks/use-analytics';

import { type StepId } from '../config/step-config';
import { useOnboardingFlowStore } from '../stores/onboarding-flow-store';

/**
 * Navigation hook for onboarding step components.
 * Wraps store actions with analytics tracking.
 *
 * Step components should use this hook instead of accessing the store directly.
 */
export const useOnboardingNavigation = () => {
  const { track } = useAnalytics();
  const {
    currentStep,
    validSteps,
    next: storeNext,
    prev: storePrev,
    goTo: storeGoTo,
    isLastStep,
    isFirstStep,
  } = useOnboardingFlowStore(
    useShallow((state) => ({
      currentStep: state.currentStep,
      validSteps: state.validSteps,
      next: state.next,
      prev: state.prev,
      goTo: state.goTo,
      isLastStep: state.isLastStep,
      isFirstStep: state.isFirstStep,
    })),
  );

  const next = useCallback(() => {
    if (!currentStep) return;

    const idx = validSteps.indexOf(currentStep);
    const nextStep = validSteps[idx + 1];

    if (nextStep) {
      track('onboarding_step_next', {
        current_step: currentStep,
        next_step: nextStep,
        steps: validSteps.map((id) => ({ id })),
      });
    }

    storeNext();
  }, [currentStep, validSteps, storeNext, track]);

  const prev = useCallback(() => {
    if (!currentStep) return;

    const idx = validSteps.indexOf(currentStep);
    const prevStep = validSteps[idx - 1];

    if (prevStep) {
      track('onboarding_step_prev', {
        current_step: currentStep,
        prev_step: prevStep,
        steps: validSteps.map((id) => ({ id })),
      });
    }

    storePrev();
  }, [currentStep, validSteps, storePrev, track]);

  const goTo = useCallback(
    (stepId: StepId) => {
      if (validSteps.includes(stepId) && stepId !== currentStep) {
        track('onboarding_step_goto', {
          current_step: currentStep,
          target_step: stepId,
          steps: validSteps.map((id) => ({ id })),
        });
      }

      storeGoTo(stepId);
    },
    [currentStep, validSteps, storeGoTo, track],
  );

  return {
    next,
    prev,
    goTo,
    currentStep,
    validSteps,
    isLastStep,
    isFirstStep,
  };
};
