import { ReactNode } from 'react';
import { createStore } from 'zustand';

import { api } from '@/lib/api-client';

export type StepItem = {
  id: string;
  content: ReactNode;
};

export interface StepperProps {
  steps: StepItem[];
  initialStep?: number;
}

export interface StepperStore extends StepperProps {
  activeStep: number;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;
  jump: (id: string) => void;

  /* We can only use nextOnboardingStep for onboarding*/
  nextOnboardingStep: (questionnaireId: string) => Promise<void>;
  /* We can only use jumpOnboarding for onboarding */
  jumpOnboarding: (stepId: string, questionnaireId: string) => Promise<void>;
  /* Updating step is a loading state for step update call */
  updatingStep: boolean;
}

export type StepperStoreApi = ReturnType<typeof stepperStoreCreator>;

export const stepperStoreCreator = (initProps?: Partial<StepperStore>) => {
  const DEFAULT_PROPS: StepperProps = {
    steps: [],
  };

  // additional check to make sure all steps are unique
  if (initProps?.steps) {
    const ids = initProps.steps.map((step) => step.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
      throw new Error('Step IDs must be unique');
    }
  }

  return createStore<StepperStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    activeStep: initProps?.initialStep ?? 0,
    nextStep: () => set((state) => ({ activeStep: state.activeStep + 1 })),
    prevStep: () => set((state) => ({ activeStep: state.activeStep - 1 })),
    updatingStep: false,
    jump: (id) => {
      const steps = get().steps;

      const stepIndex = steps.findIndex((step) => step.id === id);

      if (stepIndex === -1) {
        throw new Error('Step ID was not found.');
      }

      set({ activeStep: stepIndex });
    },
    nextOnboardingStep: async (questionnaireId) => {
      set({ updatingStep: true });
      const state = get();
      const activeStep = state.activeStep;
      await api.put<boolean>(`users/questionnaire/${questionnaireId}`, {
        progress: activeStep + 1,
      });
      set((state) => ({
        updatingStep: false,
        activeStep: state.activeStep + 1,
      }));
    },
    jumpOnboarding: async (stepId, questionnaireId) => {
      const steps = get().steps;

      const stepIndex = steps.findIndex((step) => step.id === stepId);

      if (stepIndex === -1) {
        throw new Error('Step ID was not found.');
      }

      await api.put<boolean>(`users/questionnaire/${questionnaireId}`, {
        progress: stepIndex,
      });

      set(() => ({
        updatingStep: false,
        activeStep: stepIndex,
      }));
    },
    resetSteps: () => set(() => ({ activeStep: 0 })),
  }));
};
