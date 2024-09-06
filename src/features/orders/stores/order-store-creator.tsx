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
}

export interface OrderStore extends OrderStoreProps {
  items: ServiceItem[];
  updateItems: (item: ServiceItem) => void;
  collectionMethod: CollectionMethodType;
  updateCollectionMethod: (collectionMethod: CollectionMethodType) => void;
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
  collectionMethod: 'IN_LAB' as CollectionMethodType,
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
    updateCollectionMethod: (collectionMethod: CollectionMethodType) =>
      set({ collectionMethod }),
    updateLocation: (location: Location | null) => set({ location }),
    setTz: (tz: string) => set({ tz }),
    updateSlot: (slot) => set({ slot }),
    updateCreatedOrderId: (orderId) => set({ createdOrderId: orderId }),
    updateService: (service: HealthcareService) => set({ service }),
    reset: () => set(initialState),
  }));
};
