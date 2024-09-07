import { createStore } from 'zustand';

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
}

export type OrderStoreApi = ReturnType<typeof orderStoreCreator>;

const initialState = {
  items: [],
  collectionMethod: null,
  location: null,
  slot: null,
  createdOrderId: null,
};

export const orderStoreCreator = (initProps: OrderStoreProps) => {
  return createStore<OrderStore>()((set) => ({
    ...initProps,
    ...initialState,

    updateItems: (item: ServiceItem) =>
      set((state) => {
        const isItemInArray = state.items.some(
          (existingItem) => existingItem.id === item.id,
        );

        return {
          items: isItemInArray
            ? state.items.filter((existingItem) => existingItem.id !== item.id)
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
  }));
};
