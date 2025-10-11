import { useMemo, useState } from 'react';

import { usePaymentMethods } from '@/features/settings/api';

const isFlexPaymentProvider = (provider?: string) =>
  provider?.toLowerCase() === 'flex';

type PaymentType = 'stripe' | 'flex';

/**
 * Hook for computing payment method derived values based on selected payment method ID.
 * State management should be handled by the consuming component.
 *
 * @param selectedPaymentMethodId - The currently selected payment method ID (managed by component)
 * @param isPending - Optional: if provided, enables processing state helpers for dual payment buttons
 * @returns Payment method query data and computed properties
 */
export function usePaymentMethodSelection(
  selectedPaymentMethodId?: string,
  isPending?: boolean,
) {
  const paymentMethodsQuery = usePaymentMethods();
  const paymentMethods = paymentMethodsQuery.data?.paymentMethods ?? [];
  const [processingPaymentType, setProcessingPaymentType] =
    useState<PaymentType | null>(null);

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
    [activePaymentMethod?.paymentProvider],
  );

  const hasFlexPaymentMethod = flexPaymentMethod !== undefined;

  const isProcessingStripe = processingPaymentType === 'stripe' && isPending;
  const isProcessingFlex = processingPaymentType === 'flex' && isPending;

  const primaryPaymentMethodId = (
    isFlexSelected ? defaultPaymentMethod : activePaymentMethod
  )?.externalPaymentMethodId;

  const flexPaymentMethodId = flexPaymentMethod?.externalPaymentMethodId;

  return {
    paymentMethods,
    paymentMethodsQuery,
    defaultPaymentMethod,
    flexPaymentMethod,
    activePaymentMethod,
    isFlexSelected,
    hasFlexPaymentMethod,
    setProcessingPaymentType,
    isProcessingDefault: isProcessingStripe,
    isProcessingFlex,
    primaryPaymentMethodId,
    flexPaymentMethodId,
  };
}
