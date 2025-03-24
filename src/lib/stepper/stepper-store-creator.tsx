import { ReactNode } from 'react';
import { createStore } from 'zustand';

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
  getActiveStepId: () => string;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;
  jump: (id: string) => void;
  getStepIndexById: (id: string) => number;
}

export type StepperStoreApi = ReturnType<typeof stepperStoreCreator>;

export const stepperStoreCreator = (initProps: StepperProps) => {
  // additional check to make sure all steps are unique
  if (initProps?.steps) {
    const ids = initProps.steps.map((step) => step.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
      throw new Error('Step IDs must be unique');
    }
  }

  return createStore<StepperStore>()((set, get) => ({
    ...initProps,
    activeStep: initProps?.initialStep ?? 0,

    getActiveStepId: () => {
      const { steps, activeStep } = get();
      return steps[activeStep].id;
    },
    getStepIndexById: (id) => {
      const { steps } = get();
      return steps.findIndex((s) => s.id === id);
    },
    nextStep: () => set((state) => ({ activeStep: state.activeStep + 1 })),
    prevStep: () => set((state) => ({ activeStep: state.activeStep - 1 })),
    jump: (id) => {
      const steps = get().steps;

      const stepIndex = steps.findIndex((step) => step.id === id);

      if (stepIndex === -1) {
        throw new Error('Step ID was not found.');
      }

      set({ activeStep: stepIndex });
    },
    resetSteps: () => set(() => ({ activeStep: 0 })),
  }));
};
