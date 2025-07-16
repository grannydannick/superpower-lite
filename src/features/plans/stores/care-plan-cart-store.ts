import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { Product } from '@/types/api';

interface CarePlanCartSelectedProductsState {
  selectedProducts: Product[];

  // Actions
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearAllItems: () => void;
  setProducts: (products: Product[]) => void;
  addAllProducts: (products: Product[]) => void;
  isProductSelected: (productId: string) => boolean;
  getSelectedProductsCount: () => number;
}

export const useCarePlanCart = create<CarePlanCartSelectedProductsState>()(
  devtools(
    (set, get) => ({
      selectedProducts: [],

      addProduct: (product: Product) =>
        set(
          (state) => ({
            selectedProducts: state.selectedProducts.some(
              (p) => p.id === product.id,
            )
              ? state.selectedProducts
              : [...state.selectedProducts, product],
          }),
          false,
          'addProduct',
        ),

      removeProduct: (productId: string) =>
        set(
          (state) => ({
            selectedProducts: state.selectedProducts.filter(
              (p) => p.id !== productId,
            ),
          }),
          false,
          'removeProduct',
        ),

      clearAllItems: () =>
        set({ selectedProducts: [] }, false, 'clearAllItems'),

      setProducts: (products: Product[]) =>
        set({ selectedProducts: products }, false, 'setProducts'),

      addAllProducts: (products: Product[]) =>
        set(
          (state) => ({
            selectedProducts: [
              ...state.selectedProducts,
              ...products.filter(
                (product) =>
                  !state.selectedProducts.some((p) => p.id === product.id),
              ),
            ],
          }),
          false,
          'addAllProducts',
        ),

      isProductSelected: (productId: string) => {
        const state = get();
        return state.selectedProducts.some((p) => p.id === productId);
      },

      getSelectedProductsCount: () => {
        const state = get();
        return state.selectedProducts.length;
      },
    }),
    { name: 'CarePlanCartSelectedProducts' },
  ),
);
