import { useNavigate } from '@tanstack/react-router';
import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
} from 'react';

import { useAnalytics } from '@/hooks/use-analytics';

import {
  getOnboardingAnalyticsStepId,
  type OnboardingStepId,
} from '../components/flow/onboarding-step-manifest';

interface OnboardingNavigationContextValue {
  currentStep: OnboardingStepId;
  validSteps: OnboardingStepId[];
}

const OnboardingNavigationContext =
  createContext<OnboardingNavigationContextValue | null>(null);

interface OnboardingNavigationProviderProps {
  currentStep: OnboardingStepId;
  validSteps: OnboardingStepId[];
  children: ReactNode;
}

export const OnboardingNavigationProvider = ({
  currentStep,
  validSteps,
  children,
}: OnboardingNavigationProviderProps) => {
  return createElement(
    OnboardingNavigationContext.Provider,
    { value: { currentStep, validSteps } },
    children,
  );
};

/**
 * Navigation hook for onboarding step components.
 * Wraps route navigation with analytics tracking.
 *
 * Step components should use this hook instead of navigating directly.
 */
export const useOnboardingNavigation = () => {
  const navigate = useNavigate();
  const navigationContext = useContext(OnboardingNavigationContext);
  const { track } = useAnalytics();

  if (navigationContext == null) {
    throw new Error(
      'useOnboardingNavigation must be used within OnboardingNavigationProvider',
    );
  }

  const { currentStep, validSteps } = navigationContext;

  const trackedSteps: Array<{ id: string }> = [];
  for (const id of validSteps) {
    const analyticsStepId = getOnboardingAnalyticsStepId(id);
    if (analyticsStepId == null) {
      continue;
    }

    trackedSteps.push({ id: analyticsStepId });
  }

  const currentIndex =
    currentStep == null ? -1 : validSteps.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep =
    currentIndex !== -1 && currentIndex === validSteps.length - 1;

  const navigateToStep = (stepId: OnboardingStepId) => {
    void navigate({
      to: '/onboarding/$step',
      params: { step: stepId },
    });
  };

  const next = () => {
    if (currentStep == null) return;
    if (currentIndex === -1) {
      console.warn('Onboarding next() called with unknown current step', {
        currentStep,
        validSteps,
      });
      return;
    }

    const nextStep = validSteps[currentIndex + 1];
    if (nextStep == null) {
      console.warn('Onboarding next() called on last step', {
        currentStep,
        validSteps,
      });
      return;
    }

    const currentAnalyticsStep = getOnboardingAnalyticsStepId(currentStep);
    const nextAnalyticsStep = getOnboardingAnalyticsStepId(nextStep);

    if (currentAnalyticsStep != null && nextAnalyticsStep != null) {
      track('onboarding_step_next', {
        current_step: currentAnalyticsStep,
        next_step: nextAnalyticsStep,
        steps: trackedSteps,
      });
    }

    navigateToStep(nextStep);
  };

  const prev = () => {
    if (currentStep == null) return;
    if (currentIndex === -1) {
      console.warn('Onboarding prev() called with unknown current step', {
        currentStep,
        validSteps,
      });
      return;
    }

    const prevStep = validSteps[currentIndex - 1];
    if (prevStep == null) {
      console.warn('Onboarding prev() called on first step', {
        currentStep,
        validSteps,
      });
      return;
    }

    const currentAnalyticsStep = getOnboardingAnalyticsStepId(currentStep);
    const prevAnalyticsStep = getOnboardingAnalyticsStepId(prevStep);

    if (currentAnalyticsStep != null && prevAnalyticsStep != null) {
      track('onboarding_step_prev', {
        current_step: currentAnalyticsStep,
        prev_step: prevAnalyticsStep,
        steps: trackedSteps,
      });
    }

    navigateToStep(prevStep);
  };

  const goTo = (stepId: OnboardingStepId) => {
    if (!validSteps.includes(stepId)) {
      console.warn('Onboarding goTo() called with invalid step', {
        currentStep,
        stepId,
        validSteps,
      });
      return;
    }

    if (stepId === currentStep) {
      console.warn('Onboarding goTo() called with current step', {
        currentStep,
        stepId,
      });
      return;
    }

    const currentAnalyticsStep = getOnboardingAnalyticsStepId(currentStep);
    const targetAnalyticsStep = getOnboardingAnalyticsStepId(stepId);

    if (currentAnalyticsStep != null && targetAnalyticsStep != null) {
      track('onboarding_step_goto', {
        current_step: currentAnalyticsStep,
        target_step: targetAnalyticsStep,
        steps: trackedSteps,
      });
    }

    navigateToStep(stepId);
  };

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
