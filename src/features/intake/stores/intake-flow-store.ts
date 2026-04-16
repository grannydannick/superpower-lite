import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type IntakeStepId } from '../intake-step-ids';

interface IntakeFlowStore {
  currentStep: IntakeStepId | null;
  userId: string | null;
  validSteps: IntakeStepId[];
  isInitialized: boolean;
  syncFlow: (steps: IntakeStepId[], userId: string | null) => void;
  next: () => void;
  reset: () => void;
}

export const useIntakeFlowStore = create<IntakeFlowStore>()(
  persist(
    (set, get) => ({
      currentStep: null,
      userId: null,
      validSteps: [],
      isInitialized: false,

      syncFlow: (steps, userId) => {
        const {
          currentStep,
          userId: currentUserId,
          validSteps: currentValidSteps,
          isInitialized,
        } = get();

        const userChanged = userId !== currentUserId;
        let stepsChanged = steps.length !== currentValidSteps.length;
        if (!stepsChanged) {
          for (const [index, step] of steps.entries()) {
            if (step !== currentValidSteps[index]) {
              stepsChanged = true;
              break;
            }
          }
        }

        if (isInitialized && !userChanged && !stepsChanged) {
          return;
        }

        const nextStep =
          !userChanged && currentStep !== null && steps.includes(currentStep)
            ? currentStep
            : (steps[0] ?? null);

        set({
          currentStep: nextStep,
          userId,
          validSteps: steps,
          isInitialized: true,
        });
      },

      next: () => {
        const { currentStep, validSteps } = get();
        if (currentStep == null) {
          return;
        }

        const currentIndex = validSteps.indexOf(currentStep);
        const nextStep = validSteps[currentIndex + 1];
        if (nextStep == null) {
          return;
        }

        set({
          currentStep: nextStep,
        });
      },

      reset: () => {
        set({
          currentStep: null,
          userId: null,
          validSteps: [],
          isInitialized: false,
        });
      },
    }),
    {
      name: 'intake-flow-step',
      partialize: (state) => ({
        currentStep: state.currentStep,
        userId: state.userId,
      }),
    },
  ),
);
