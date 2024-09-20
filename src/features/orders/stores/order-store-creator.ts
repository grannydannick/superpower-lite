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
  draftOrderId: string | null;
}

/*
 * NB:
 * @param {string} draftOrderId - Draft order id that we only PASS into order store (for example if we already created order before)
 * @param {string} createdOrderId - Can be updated as we set it on summary step after successful booking
 *
 * `draftOrderId` typically corresponds to id of order of status `DRAFT`
 * `createdOrderId` typically corresponds to id of order of status `PENDING`
 * */
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
  draftOrderId: null,
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
