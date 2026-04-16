import { useShallow } from 'zustand/react/shallow';

import { useIntakeFlowStore } from '../stores/intake-flow-store';

export const useIntakeNavigation = () => {
  const { currentStep, next, validSteps } = useIntakeFlowStore(
    useShallow((state) => ({
      currentStep: state.currentStep,
      next: state.next,
      validSteps: state.validSteps,
    })),
  );

  const currentIndex =
    currentStep == null ? -1 : validSteps.indexOf(currentStep);

  return {
    currentStep,
    next,
    validSteps,
    isFirstStep: currentIndex === 0,
    isLastStep: currentIndex !== -1 && currentIndex === validSteps.length - 1,
  };
};
