import { createStore } from 'zustand';

import { PlanGoal, Product } from '@/types/api';

export interface CheckoutStoreProps {
  goals: PlanGoal[];
}

export interface CheckoutStore extends CheckoutStoreProps {
  selectedProducts: Product[];
  updateSelectedProducts: (product: Product) => void;
}

export type CheckoutStoreApi = ReturnType<typeof checkoutStoreCreator>;

export const checkoutStoreCreator = (
  initProps?: Partial<CheckoutStoreProps>,
) => {
  const DEFAULT_PROPS: CheckoutStoreProps = {
    goals: [],
  };

  return createStore<CheckoutStore>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    selectedProducts: [],
    updateSelectedProducts: (product: Product) => {
      set((state) => {
        const existing = state.selectedProducts.find(
          (pr) => pr.id === product.id,
        );

        if (existing) {
          // Remove the product if it already exists
          return {
            ...state,
            selectedProducts: state.selectedProducts.filter(
              (pr) => pr.id !== product.id,
            ),
          };
        }

        // Add the new product if it doesn't exist
        return {
          ...state,
          selectedProducts: [...state.selectedProducts, product],
        };
      });
    },
  }));
};
