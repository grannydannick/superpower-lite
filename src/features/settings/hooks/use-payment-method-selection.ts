import { useMemo } from 'react';

import { usePaymentMethods } from '@/features/settings/api';

const isFlexPaymentProvider = (provider?: string) =>
  provider?.toLowerCase() === 'flex';

/**
 * Hook for computing payment method derived values based on selected payment method ID.
 * State management should be handled by the consuming component.
 *
 * @param selectedPaymentMethodId - The currently selected payment method ID (managed by component)
 * @returns Payment method query data and computed properties
 */
export function usePaymentMethodSelection(selectedPaymentMethodId?: string) {
  const paymentMethodsQuery = usePaymentMethods();
  const paymentMethods = paymentMethodsQuery.data?.paymentMethods ?? [];

  const defaultPaymentMethod = useMemo(
    () => paymentMethods.find((pm) => pm.default),
    [paymentMethods],
  );

  const flexPaymentMethod = useMemo(
    () =>
      paymentMethods.find((pm) => isFlexPaymentProvider(pm.paymentProvider)),
    [paymentMethods],
  );

  const activePaymentMethod = useMemo(
    () =>
      selectedPaymentMethodId
        ? paymentMethods.find(
            (pm) => pm.externalPaymentMethodId === selectedPaymentMethodId,
          )
        : defaultPaymentMethod,
    [selectedPaymentMethodId, paymentMethods, defaultPaymentMethod],
  );

  const isFlexSelected = useMemo(
    () => isFlexPaymentProvider(activePaymentMethod?.paymentProvider),
    [activePaymentMethod],
  );

  const hasFlexPaymentMethod = flexPaymentMethod !== undefined;

  return {
    paymentMethods,
    paymentMethodsQuery,
    defaultPaymentMethod,
    flexPaymentMethod,
    activePaymentMethod,
    isFlexSelected,
    hasFlexPaymentMethod,
  };
}
