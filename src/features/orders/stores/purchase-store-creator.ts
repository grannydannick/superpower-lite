import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { HealthcareService } from '@/types/api';

import { CreateCreditInput } from '../api/credits';

export interface PurchaseStoreProps {
  service: HealthcareService;
}

export interface PurchaseStore extends PurchaseStoreProps {
  informedConsent: boolean | null;
  updateInformedConsent: (agreed: boolean) => void; // Updates consent with agreedToConsent and agreedAt
  buildCreateCreditData: () => CreateCreditInput;
  reset: () => void;
}

export type PurchaseStoreApi = ReturnType<typeof purchaseStoreCreator>;

const initialState = {
  informedConsent: null,
  addOnIds: new Set<string>(),
};

export const purchaseStoreCreator = (initProps: PurchaseStoreProps) => {
  return createStore<PurchaseStore>()(
    devtools(
      (set, get) => ({
        ...initProps,
        ...initialState,

        reset: () => {
          set({
            ...initialState,
          });
        },
        updateInformedConsent: (informedConsent: boolean) =>
          set({ informedConsent }),
        buildCreateCreditData: (
          paymentMethodId?: string,
        ): CreateCreditInput => {
          const service = get().service;
          const informedConsent = get().informedConsent;

          const data: CreateCreditInput = {
            informedConsent: informedConsent ? 'test-kit' : undefined,
            serviceIds: [service.id],
            paymentMethodId,
          };

          return data;
        },
      }),
      { name: 'PurchaseStore' },
    ),
  );
};
