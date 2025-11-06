import { create } from 'zustand';

import { PaymentMethod } from '@/types/api';

const isFlexPaymentProvider = (provider?: string) =>
  provider?.toLowerCase() === 'flex';

interface PaymentMethodStoreState {
  selectedPaymentMethodId: string | undefined;
  isSelectingPaymentMethod: boolean;
  setActivePaymentMethod: (paymentMethodId: string) => void;
  startSelectingPaymentMethod: () => void;

  // Selectors
  getDefaultPaymentMethod: (
    paymentMethods: PaymentMethod[],
  ) => PaymentMethod | undefined;
  getFlexPaymentMethod: (
    paymentMethods: PaymentMethod[],
  ) => PaymentMethod | undefined;
  getActivePaymentMethod: (
    paymentMethods: PaymentMethod[],
    selectedPaymentMethodId?: string,
  ) => PaymentMethod | undefined;
  getIsFlexSelected: (activePaymentMethod?: PaymentMethod) => boolean;
  getHasFlexPaymentMethod: (flexPaymentMethod?: PaymentMethod) => boolean;
}

export const usePaymentMethodStore = create<PaymentMethodStoreState>()(
  (set, get) => ({
    selectedPaymentMethodId: undefined,
    isSelectingPaymentMethod: false,
    setActivePaymentMethod: (paymentMethodId) =>
      set(() => ({
        selectedPaymentMethodId: paymentMethodId,
        isSelectingPaymentMethod: false,
      })),
    startSelectingPaymentMethod: () =>
      set(() => ({
        isSelectingPaymentMethod: true,
      })),
    getDefaultPaymentMethod: (paymentMethods) =>
      paymentMethods.find((pm) => pm.default) ??
      (paymentMethods.length > 0 ? paymentMethods[0] : undefined),
    getFlexPaymentMethod: (paymentMethods) =>
      paymentMethods.find((pm) => isFlexPaymentProvider(pm.paymentProvider)),
    getActivePaymentMethod: (paymentMethods, selectedPaymentMethodId) => {
      const defaultPaymentMethod =
        get().getDefaultPaymentMethod(paymentMethods);
      return selectedPaymentMethodId
        ? paymentMethods.find(
            (pm) => pm.externalPaymentMethodId === selectedPaymentMethodId,
          )
        : defaultPaymentMethod;
    },
    getIsFlexSelected: (activePaymentMethod) =>
      isFlexPaymentProvider(activePaymentMethod?.paymentProvider),
    getHasFlexPaymentMethod: (flexPaymentMethod) =>
      flexPaymentMethod !== undefined,
  }),
);
