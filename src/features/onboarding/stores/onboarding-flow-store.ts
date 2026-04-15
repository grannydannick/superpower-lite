import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type StepId } from '../config/step-config';

/**
 * Shared flow store for onboarding + intake navigation.
 *
 * Key model:
 * - `validSteps` is recomputed from fresh query-derived context.
 * - `currentStep` is persisted so users can resume after hard reload.
 * - `syncFlow` reconciles those two worlds.
 * - `hasSeenGiftUpsell` is a one-time dismissal flag.
 *
 * Reconciliation rules:
 * - Same user + still-valid step -> resume previous step.
 * - User changed or step no longer valid -> start from first valid step.
 * - No meaningful change -> no-op to avoid unnecessary re-renders.
 */
interface OnboardingFlowStore {
  currentStep: StepId | null;
  userId: string | null;
  validSteps: StepId[];
  isInitialized: boolean;
  isLastStep: boolean;
  isFirstStep: boolean;
  hasSeenGiftUpsell: boolean;
  /** True while waiting for an external redirect (e.g. gift checkout) to complete. */
  isExternalRedirectPending: boolean;

  // Actions
  /** Canonical reconciliation entrypoint used by flow hooks. */
  syncFlow: (steps: StepId[], userId: string | null) => void;
  next: () => void;
  prev: () => void;
  goTo: (stepId: StepId) => void;
  dismissGiftUpsell: () => void;
  /** Call before window.location.assign() to prevent StepRenderer from flashing the next step. */
  beginExternalRedirect: () => void;
  /** Full reset used when flow is completed or session is cleared. */
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
  persist(
    (set, get) => ({
      currentStep: null,
      userId: null,
      validSteps: [],
      isInitialized: false,
      isLastStep: false,
      isFirstStep: false,
      hasSeenGiftUpsell: false,
      isExternalRedirectPending: false,

      // Single reconciliation path used by both onboarding/intake hooks.
      syncFlow: (steps, userId) => {
        const {
          currentStep,
          userId: currentUserId,
          validSteps: currentValidSteps,
          isInitialized,
        } = get();
        const userChanged = userId !== currentUserId;
        // Compare by value, not reference, because hooks may create new arrays.
        let stepsChanged = steps.length !== currentValidSteps.length;
        if (!stepsChanged) {
          for (const [index, step] of steps.entries()) {
            if (step !== currentValidSteps[index]) {
              stepsChanged = true;
              break;
            }
          }
        }

        // Avoid redundant store writes/re-renders when nothing meaningful changed.
        if (isInitialized && !userChanged && !stepsChanged) return;

        // Same user resumes where they left off if that step is still valid.
        const resumeStep =
          !userChanged && currentStep !== null && steps.includes(currentStep)
            ? currentStep
            : (steps[0] ?? null);

        // Reset the gift upsell flag when switching between two distinct users on
        // the same device, so each user gets their own chance to see it.
        const switchingUsers = userChanged && !!userId && !!currentUserId;

        set({
          validSteps: steps,
          currentStep: resumeStep,
          userId,
          isInitialized: true,
          ...(switchingUsers ? { hasSeenGiftUpsell: false } : {}),
          ...computeStepFlags(resumeStep, steps),
        });
      },

      next: () => {
        const { validSteps, currentStep } = get();
        // Flow has not been initialized yet.
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
        // Flow has not been initialized yet.
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
        // Prevent navigation to steps excluded by current context.
        if (validSteps.includes(stepId)) {
          set({
            currentStep: stepId,
            ...computeStepFlags(stepId, validSteps),
          });
        }
      },

      dismissGiftUpsell: () => set({ hasSeenGiftUpsell: true }),

      beginExternalRedirect: () => {
        set({ isExternalRedirectPending: true });
      },

      reset: () =>
        set({
          currentStep: null,
          userId: null,
          validSteps: [],
          isInitialized: false,
          isLastStep: false,
          isFirstStep: false,
          hasSeenGiftUpsell: false,
          isExternalRedirectPending: false,
        }),
    }),
    {
      // Persist in localStorage by default via zustand/persist.
      name: 'onboarding-flow-step',
      // Persist only what is needed to resume on hard reload.
      partialize: (state) => ({
        currentStep: state.currentStep,
        userId: state.userId,
        hasSeenGiftUpsell: state.hasSeenGiftUpsell,
      }),
    },
  ),
);
