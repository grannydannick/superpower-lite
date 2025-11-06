import { useMemo } from 'react';

import { usePaymentMethods } from '@/features/settings/api';
import { usePaymentMethodStore } from '@/features/settings/stores/payment-method-store';

/**
 * Hook for computing payment method derived values based on selected payment method ID.
 * State management and computation logic is handled by the zustand store.
 *
 * @returns Payment method query data and computed properties
 */
export function usePaymentMethodSelection() {
  const {
    selectedPaymentMethodId,
    isSelectingPaymentMethod,
    setActivePaymentMethod,
    startSelectingPaymentMethod,
    getDefaultPaymentMethod,
    getFlexPaymentMethod,
    getActivePaymentMethod,
    getIsFlexSelected,
    getHasFlexPaymentMethod,
  } = usePaymentMethodStore((s) => ({
    selectedPaymentMethodId: s.selectedPaymentMethodId,
    isSelectingPaymentMethod: s.isSelectingPaymentMethod,
    setActivePaymentMethod: s.setActivePaymentMethod,
    startSelectingPaymentMethod: s.startSelectingPaymentMethod,
    getDefaultPaymentMethod: s.getDefaultPaymentMethod,
    getFlexPaymentMethod: s.getFlexPaymentMethod,
    getActivePaymentMethod: s.getActivePaymentMethod,
    getIsFlexSelected: s.getIsFlexSelected,
    getHasFlexPaymentMethod: s.getHasFlexPaymentMethod,
  }));

  const paymentMethodsQuery = usePaymentMethods();
  const paymentMethods = useMemo(
    () => paymentMethodsQuery.data?.paymentMethods ?? [],
    [paymentMethodsQuery.data?.paymentMethods],
  );

  const defaultPaymentMethod = useMemo(
    () => getDefaultPaymentMethod(paymentMethods),
    [getDefaultPaymentMethod, paymentMethods],
  );

  const flexPaymentMethod = useMemo(
    () => getFlexPaymentMethod(paymentMethods),
    [getFlexPaymentMethod, paymentMethods],
  );

  const activePaymentMethod = useMemo(
    () => getActivePaymentMethod(paymentMethods, selectedPaymentMethodId),
    [getActivePaymentMethod, paymentMethods, selectedPaymentMethodId],
  );

  const isFlexSelected = useMemo(
    () => getIsFlexSelected(activePaymentMethod),
    [getIsFlexSelected, activePaymentMethod],
  );

  const hasFlexPaymentMethod = useMemo(
    () => getHasFlexPaymentMethod(flexPaymentMethod),
    [getHasFlexPaymentMethod, flexPaymentMethod],
  );

  const isLoading = useMemo(
    () => paymentMethodsQuery.isLoading,
    [paymentMethodsQuery.isLoading],
  );

  return {
    paymentMethods,
    defaultPaymentMethod,
    flexPaymentMethod,
    activePaymentMethod,
    activePaymentMethodId: activePaymentMethod?.externalPaymentMethodId,
    setActivePaymentMethod,
    startSelectingPaymentMethod,
    isFlexSelected,
    hasFlexPaymentMethod,
    isSelectingPaymentMethod,
    isLoading,
  };
}
