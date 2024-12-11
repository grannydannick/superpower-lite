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
  OrderStore,
  OrderStoreApi,
  orderStoreCreator,
  OrderStoreProps,
} from '@/features/orders/stores/order-store-creator';

export const OrderStoreContext = createContext<OrderStoreApi | undefined>(
  undefined,
);

type OrderStoreProviderProps = PropsWithChildren<OrderStoreProps>;

export const OrderStoreProvider = ({
  children,
  ...props
}: OrderStoreProviderProps) => {
  const orderStoreRef = useRef<OrderStoreApi>();
  if (!orderStoreRef.current) {
    orderStoreRef.current = orderStoreCreator(props);
  }

  /**
   * The useEffects above is small hack for props that rely on API call for service,
   * the problem is that because store is a ref, it doesnt care if something got updated so it executes immidiately,
   * later to sync the state we need to force rerender by that useEffect
   *
   * This is tech debt and we should potentially find better way because
   * it can cause different sideeffects with rerenders when any of that states change
   */
  useEffect(() => {
    orderStoreRef.current?.setState({
      collectionMethod: props.collectionMethod,
    });
  }, [props.collectionMethod]);

  useEffect(() => {
    orderStoreRef.current?.setState({
      service: props.service,
    });
  }, [props.service]);

  return (
    <OrderStoreContext.Provider value={orderStoreRef.current}>
      {children}
    </OrderStoreContext.Provider>
  );
};

export type UseOrderStoreContextSelector<T> = (store: OrderStore) => T;

export const useOrder = <T,>(selector: UseOrderStoreContextSelector<T>): T => {
  const orderStoreContext = useContext(OrderStoreContext);

  if (orderStoreContext === undefined) {
    throw new Error('useOrder must be used within OrderStoreProvider');
  }

  return useStoreWithEqualityFn(orderStoreContext, selector, shallow);
};
