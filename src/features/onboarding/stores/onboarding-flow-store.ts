import { create } from 'zustand';

import { type StepId } from '../config/step-config';

interface OnboardingFlowStore {
  currentStep: StepId | null;
  validSteps: StepId[];
  isInitialized: boolean;
  isLastStep: boolean;
  isFirstStep: boolean;

  // Actions
  initialize: (steps: StepId[]) => void;
  /** Update valid steps without changing current step. Used when context changes (e.g., gender set). */
  updateSteps: (steps: StepId[]) => void;
  next: () => void;
  prev: () => void;
  goTo: (stepId: StepId) => void;
  reset: () => void;
}

// Helper to compute step flags
const computeStepFlags = (
  currentStep: StepId | null,
  validSteps: StepId[],
) => ({
  isLastStep:
    currentStep !== null &&
    validSteps.indexOf(currentStep) === validSteps.length - 1,
  isFirstStep: currentStep !== null && validSteps.indexOf(currentStep) === 0,
});

export const useOnboardingFlowStore = create<OnboardingFlowStore>()(
  (set, get) => ({
    currentStep: null,
    validSteps: [],
    isInitialized: false,
    isLastStep: false,
    isFirstStep: false,

    initialize: (steps) => {
      const currentStep = steps[0] ?? null;
      set({
        validSteps: steps,
        currentStep,
        isInitialized: true,
        ...computeStepFlags(currentStep, steps),
      });
    },

    updateSteps: (steps) => {
      const { currentStep } = get();
      // Keep current step if it's still valid, otherwise go to first step
      const newCurrentStep =
        currentStep && steps.includes(currentStep)
          ? currentStep
          : steps[0] ?? null;
      set({
        validSteps: steps,
        currentStep: newCurrentStep,
        ...computeStepFlags(newCurrentStep, steps),
      });
    },

    next: () => {
      const { validSteps, currentStep } = get();
      if (!currentStep) return;
      const idx = validSteps.indexOf(currentStep);
      const nextStep = validSteps[idx + 1];
      if (nextStep) {
        set({
          currentStep: nextStep,
          ...computeStepFlags(nextStep, validSteps),
        });
      }
    },

    prev: () => {
      const { validSteps, currentStep } = get();
      if (!currentStep) return;
      const idx = validSteps.indexOf(currentStep);
      const prevStep = validSteps[idx - 1];
      if (prevStep) {
        set({
          currentStep: prevStep,
          ...computeStepFlags(prevStep, validSteps),
        });
      }
    },

    goTo: (stepId) => {
      const { validSteps } = get();
      if (validSteps.includes(stepId)) {
        set({
          currentStep: stepId,
          ...computeStepFlags(stepId, validSteps),
        });
      }
    },

    reset: () =>
      set({
        currentStep: null,
        validSteps: [],
        isInitialized: false,
        isLastStep: false,
        isFirstStep: false,
      }),
  }),
);
