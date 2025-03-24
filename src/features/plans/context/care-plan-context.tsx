import { CarePlan } from '@medplum/fhirtypes';
import { createContext, ReactNode, useContext } from 'react';

interface CarePlanContextData {
  plan: CarePlan;
  isAnnualReport: boolean;
}

const CarePlanContext = createContext<CarePlanContextData | null>(null);

type CarePlanProviderProps = CarePlanContextData & {
  children: ReactNode;
  isAnnualReport?: boolean;
};

/**
 * Provider component that wraps app to provide care plan context
 */
export function CarePlanProvider({
  children,
  isAnnualReport = false,
  ...contextProps
}: CarePlanProviderProps) {
  return (
    <CarePlanContext.Provider
      value={{
        isAnnualReport,
        ...contextProps,
      }}
    >
      {children}
    </CarePlanContext.Provider>
  );
}

/**
 * Hook to access care plan context data
 * @throws Error if used outside of CarePlanProvider
 */
export function useCarePlan(): CarePlanContextData {
  const context = useContext(CarePlanContext);

  if (!context) {
    throw new Error('useCarePlan must be used within a CarePlanProvider');
  }

  return context;
}
