import { createContext, useContext, useRef, PropsWithChildren } from 'react';
import { shallow } from 'zustand/shallow';
import { useStoreWithEqualityFn } from 'zustand/traditional';

import {
  PlanStore,
  PlanStoreApi,
  planStoreCreator,
  PlanStoreProps,
} from '@/features/action-plan/stores/plan-store-creator';

export const PlanStoreContext = createContext<PlanStoreApi | undefined>(
  undefined,
);

type PlanStoreProviderProps = PropsWithChildren<PlanStoreProps>;

export const PlanStoreProvider = ({
  children,
  ...props
}: PlanStoreProviderProps) => {
  const planStoreRef = useRef<PlanStoreApi>();
  if (!planStoreRef.current) {
    planStoreRef.current = planStoreCreator(props);
  }

  return (
    <PlanStoreContext.Provider value={planStoreRef.current}>
      {children}
    </PlanStoreContext.Provider>
  );
};

export type UsePlanStoreContextSelector<T> = (store: PlanStore) => T;

export const usePlan = <T,>(selector: UsePlanStoreContextSelector<T>): T => {
  const planStoreContext = useContext(PlanStoreContext);

  if (planStoreContext === undefined) {
    throw new Error('usePlan must be used within PlanStoreProvider');
  }

  return useStoreWithEqualityFn(planStoreContext, selector, shallow);
};
