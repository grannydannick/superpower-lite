import {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from 'react';
import { shallow } from 'zustand/shallow';
import { useStoreWithEqualityFn } from 'zustand/traditional';

import {
  AppointmentSchedulerProps,
  AppointmentSchedulerStore,
  AppointmentSchedulerStoreApi,
  appointmentSchedulerStoreCreator,
} from './appointment-scheduler-store-creator';

export const AppointmentSchedulerStoreContext = createContext<
  AppointmentSchedulerStoreApi | undefined
>(undefined);

type AppointmentSchedulerStoreProviderProps =
  PropsWithChildren<AppointmentSchedulerProps>;

export const AppointmentSchedulerStoreProvider = ({
  children,
  ...props
}: AppointmentSchedulerStoreProviderProps) => {
  const [store] = useState(() => appointmentSchedulerStoreCreator(props));

  useEffect(() => {
    store.setState({ onSlotUpdate: props.onSlotUpdate });
  }, [props.onSlotUpdate, store]);

  return (
    <AppointmentSchedulerStoreContext.Provider value={store}>
      {children}
    </AppointmentSchedulerStoreContext.Provider>
  );
};

export type UseAppointmentSchedulerStoreContextSelector<T> = (
  store: AppointmentSchedulerStore,
) => T;

export const useAppointmentScheduler = <T,>(
  selector: UseAppointmentSchedulerStoreContextSelector<T>,
): T => {
  const context = useContext(AppointmentSchedulerStoreContext);

  if (context === undefined) {
    throw new Error(
      'useAppointmentScheduler must be used within AppointmentSchedulerStoreProvider',
    );
  }

  return useStoreWithEqualityFn(context, selector, shallow);
};
