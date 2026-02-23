import * as z from 'zod';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { Activity } from '../api';

// Zod schemas for cart items (matching backend expectations)
export const serviceCartItemSchema = z.object({
  type: z.literal('service'),
  serviceId: z.string(),
  serviceName: z.string(),
  unitPriceCents: z.number(),
  recommendedFromGoalId: z.string().optional(),
});

export const productCartItemSchema = z.object({
  type: z.literal('product'),
  shopifyVariantId: z.string(),
  shopifyProductId: z.string().optional(),
  title: z.string(),
  unitPriceCents: z.number(),
  isSubscription: z.boolean().optional(),
  subscriptionInterval: z.enum(['DAY', 'WEEK', 'MONTH']).optional(),
  subscriptionEvery: z.number().optional(),
  recommendedFromGoalId: z.string().optional(),
});

export const rxCartItemSchema = z.object({
  type: z.literal('rx'),
  rxCatalogId: z.string(),
  title: z.string(),
  unitPriceCents: z.number(),
  recommendedFromGoalId: z.string().optional(),
});

export const cartItemSchema = z.discriminatedUnion('type', [
  serviceCartItemSchema,
  productCartItemSchema,
  rxCartItemSchema,
]);

export type ServiceCartItem = z.infer<typeof serviceCartItemSchema>;
export type ProductCartItem = z.infer<typeof productCartItemSchema>;
export type RxCartItem = z.infer<typeof rxCartItemSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

interface RevealCartStore {
  // Cart items grouped by type
  services: ServiceCartItem[];
  products: ProductCartItem[];
  rx: RxCartItem[];

  // Actions
  addService: (
    activity: Extract<Activity, { type: 'service' }>,
    goalId?: string,
  ) => void;
  addProduct: (
    activity: Extract<Activity, { type: 'product' }>,
    goalId?: string,
  ) => void;
  addRx: (
    activity: Extract<Activity, { type: 'prescription' }>,
    goalId?: string,
  ) => void;
  addActivities: (activities: Activity[], goalId?: string) => void;
  removeService: (serviceId: string) => void;
  removeProduct: (shopifyVariantId: string) => void;
  removeRx: (rxCatalogId: string) => void;
  clear: () => void;

  // Getters
  getAllItems: () => CartItem[];
  getServices: () => ServiceCartItem[];
  getProducts: () => ProductCartItem[];
  getRx: () => RxCartItem[];
  getTotalItems: () => number;
  hasItems: () => boolean;
}

const initialState = {
  services: [],
  products: [],
  rx: [],
};

// Helper to convert Activity to CartItem
function activityToCartItem(
  activity: Activity,
  goalId?: string,
): CartItem | null {
  switch (activity.type) {
    case 'service': {
      return {
        type: 'service',
        serviceId: activity.service.id,
        serviceName: activity.service.name,
        unitPriceCents: activity.service.price, // Already in cents
        ...(goalId && { recommendedFromGoalId: goalId }),
      };
    }
    case 'product': {
      // Extract Shopify variant ID from product URL or use product ID
      // Assuming product.id is the shopify variant ID
      const shopifyVariantId = activity.product.id || '';
      const unitPriceCents = Math.round((activity.product.price || 0) * 100); // Convert dollars to cents

      return {
        type: 'product',
        shopifyVariantId,
        shopifyProductId: undefined, // TODO: Extract from product if available
        title: activity.product.name,
        unitPriceCents,
        ...(goalId && { recommendedFromGoalId: goalId }),
      };
    }
    case 'prescription': {
      const unitPriceCents = Math.round(
        parseFloat(activity.prescription.price || '0') * 100,
      );

      return {
        type: 'rx',
        rxCatalogId: activity.prescription.id,
        title: activity.prescription.name,
        unitPriceCents,
        ...(goalId && { recommendedFromGoalId: goalId }),
      };
    }
    case 'general':
      // General activities don't go in the cart
      return null;
    default:
      return null;
  }
}

export const useRevealCartStore = create<RevealCartStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        addService: (activity, goalId) => {
          const item = activityToCartItem(activity, goalId);
          if (item && item.type === 'service') {
            set((state) => {
              // Check if already exists
              const exists = state.services.some(
                (s) => s.serviceId === item.serviceId,
              );
              if (exists) return state;

              return {
                services: [...state.services, item],
              };
            });
          }
        },

        addProduct: (activity, goalId) => {
          const item = activityToCartItem(activity, goalId);
          if (item && item.type === 'product') {
            set((state) => {
              // Check if already exists
              const exists = state.products.some(
                (p) => p.shopifyVariantId === item.shopifyVariantId,
              );
              if (exists) return state;

              return {
                products: [...state.products, item],
              };
            });
          }
        },

        addRx: (activity, goalId) => {
          const item = activityToCartItem(activity, goalId);
          if (item && item.type === 'rx') {
            set((state) => {
              // Check if already exists
              const exists = state.rx.some(
                (r) => r.rxCatalogId === item.rxCatalogId,
              );
              if (exists) return state;

              return {
                rx: [...state.rx, item],
              };
            });
          }
        },

        addActivities: (activities, goalId) => {
          const items = activities
            .map((activity) => activityToCartItem(activity, goalId))
            .filter((item): item is CartItem => item !== null);

          set((state) => {
            const newServices = items
              .filter(
                (item): item is ServiceCartItem => item.type === 'service',
              )
              .filter(
                (item) =>
                  !state.services.some((s) => s.serviceId === item.serviceId),
              );

            const newProducts = items
              .filter(
                (item): item is ProductCartItem => item.type === 'product',
              )
              .filter(
                (item) =>
                  !state.products.some(
                    (p) => p.shopifyVariantId === item.shopifyVariantId,
                  ),
              );

            const newRx = items
              .filter((item): item is RxCartItem => item.type === 'rx')
              .filter(
                (item) =>
                  !state.rx.some((r) => r.rxCatalogId === item.rxCatalogId),
              );

            return {
              services: [...state.services, ...newServices],
              products: [...state.products, ...newProducts],
              rx: [...state.rx, ...newRx],
            };
          });
        },

        removeService: (serviceId) => {
          set((state) => ({
            services: state.services.filter((s) => s.serviceId !== serviceId),
          }));
        },

        removeProduct: (shopifyVariantId) => {
          set((state) => ({
            products: state.products.filter(
              (p) => p.shopifyVariantId !== shopifyVariantId,
            ),
          }));
        },

        removeRx: (rxCatalogId) => {
          set((state) => ({
            rx: state.rx.filter((r) => r.rxCatalogId !== rxCatalogId),
          }));
        },

        clear: () => {
          set(initialState);
        },

        getAllItems: () => {
          const state = get();
          return [...state.services, ...state.products, ...state.rx];
        },

        getServices: () => {
          return get().services;
        },

        getProducts: () => {
          return get().products;
        },

        getRx: () => {
          return get().rx;
        },

        getTotalItems: () => {
          const state = get();
          return (
            state.services.length + state.products.length + state.rx.length
          );
        },

        hasItems: () => {
          return get().getTotalItems() > 0;
        },
      }),
      {
        name: 'protocol-reveal-cart', // localStorage key
        // Only persist the cart data, not the functions
        partialize: (state) => ({
          services: state.services,
          products: state.products,
          rx: state.rx,
        }),
      },
    ),
    { name: 'RevealCartStore' },
  ),
);
