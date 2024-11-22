import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  CollectionMethodType,
  HealthcareService,
  Location,
  ServiceItem,
  Slot,
} from '@/types/api';

export interface OrderStoreProps {
  service: HealthcareService;
  tz: string;
  collectionMethod: CollectionMethodType | null;
}

/**
 * NB:
 * @param {string} createdOrderId - Can be updated as we set it on summary step after successful booking
 *
 * `createdOrderId` typically corresponds to id of order of status `PENDING`
 */
export interface OrderStore extends OrderStoreProps {
  items: ServiceItem[];
  updateItems: (item: ServiceItem) => void;
  updateCollectionMethod: (
    collectionMethod: CollectionMethodType | null,
  ) => void;

  location: Location | null;
  updateLocation: (location: Location | null) => void;
  setTz: (tz: string) => void;
  slot: Slot | null;
  updateSlot: (slot: Slot | null) => void;
  createdOrderId: string | null;
  updateCreatedOrderId: (orderId: string | null) => void;
  updateService: (service: HealthcareService) => void;
  reset: () => void;
  // Needs to be an optional because not all orders will have informed consent
  informedConsent: boolean | null;
  updateInformedConsent: (agreed: boolean) => void; // Updates consent with agreedToConsent and agreedAt
}

export type OrderStoreApi = ReturnType<typeof orderStoreCreator>;

// Define the initial state
// We don't want to reset collectionMethod and draftOrder here because we would need to refetch them if we do
const initialState = {
  items: [],
  location: null,
  slot: null,
  createdOrderId: null,
  informedConsent: null,
};

export const orderStoreCreator = (initProps: OrderStoreProps) => {
  return createStore<OrderStore>()(
    devtools(
      (set) => ({
        ...initProps,
        ...initialState,

        updateItems: (item: ServiceItem) =>
          set((state) => {
            const isItemInArray = state.items.some(
              (existingItem) => existingItem.id === item.id,
            );

            return {
              items: isItemInArray
                ? state.items.filter(
                    (existingItem) => existingItem.id !== item.id,
                  )
                : [...state.items, item],
            };
          }),
        updateCollectionMethod: (collectionMethod) => set({ collectionMethod }),
        updateLocation: (location) => set({ location }),
        setTz: (tz) => set({ tz }),
        updateSlot: (slot) => set({ slot }),
        updateCreatedOrderId: (orderId) => set({ createdOrderId: orderId }),
        updateService: (service) => set({ service }),
        reset: () => set(initialState),

        // Update consent and set the agreedAt date when consent is given
        updateInformedConsent: (informedConsent: boolean) =>
          set({ informedConsent }),
      }),
      { name: 'OrderStore' },
    ),
  );
};
