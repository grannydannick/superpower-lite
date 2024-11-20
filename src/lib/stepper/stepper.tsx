import {
  createContext,
  useContext,
  useRef,
  PropsWithChildren,
  useEffect,
} from 'react';
import { shallow } from 'zustand/shallow';
import { useStoreWithEqualityFn } from 'zustand/traditional';

import {
  StepperProps,
  type StepperStore,
  StepperStoreApi,
  stepperStoreCreator,
} from './stepper-store-creator';

export const StepperStoreContext = createContext<StepperStoreApi | undefined>(
  undefined,
);

type StepperStoreProviderProps = PropsWithChildren<StepperProps>;

export const StepperStoreProvider = ({
  children,
  ...props
}: StepperStoreProviderProps) => {
  const stepperStoreRef = useRef<StepperStoreApi>();
  if (!stepperStoreRef.current) {
    stepperStoreRef.current = stepperStoreCreator(props);
  }

  useEffect(() => {
    stepperStoreRef.current?.setState({ steps: props.steps });
  }, [props.steps]);

  return (
    <StepperStoreContext.Provider value={stepperStoreRef.current}>
      {children}
    </StepperStoreContext.Provider>
  );
};

export type UseStepperStoreContextSelector<T> = (store: StepperStore) => T;

/*
 * Example usage:
 *
 * const Step = () => {
 *  const { steps, activeStep } = useStepper((s) => s);
 *
 *  return steps[activeStep]?.content ?? null;
 * };
 *
 * Initialize store:
 * <StepperStoreProvider steps={steps}>
 *  <Step />
 * </StepperStoreProvider>
 *
 * To access store data:
 * const { nextStep } = useStepper((s) => s);
 * */
export const useStepper = <T,>(
  selector: UseStepperStoreContextSelector<T>,
): T => {
  const stepperStoreContext = useContext(StepperStoreContext);

  if (stepperStoreContext === undefined) {
    throw new Error('useStepper must be used within StepperStoreProvider');
  }

  return useStoreWithEqualityFn(stepperStoreContext, selector, shallow);
};
