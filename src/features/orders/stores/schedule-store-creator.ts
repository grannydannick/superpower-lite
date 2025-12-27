import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { CreateOrderInput } from '@/features/orders/api';
import {
  CollectionMethodType,
  PhlebotomyLocation,
  Slot,
  AppointmentType,
  ServiceGroup,
} from '@/types/api';

export interface ScheduleStoreProps {
  onSuccess?: () => void;
  onDone?: () => void;
  // used for filtering
  mode: ServiceGroup;
}

export interface ScheduleStore extends ScheduleStoreProps {
  collectionMethod: CollectionMethodType | null;
  updateCollectionMethod: (
    collectionMethod: CollectionMethodType | null,
  ) => void;

  selectedCreditIds: Set<string>;
  updateSelectedCreditIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  location: PhlebotomyLocation | null;
  updateLocation: (location: PhlebotomyLocation | null) => void;
  tz: string | null;
  updateTz: (tz: string | null) => void;
  slot: Slot | null;
  updateSlot: (slot: Slot | null) => void;
  reset: () => void;

  buildCreateOrderData: () => CreateOrderInput;
}

export type ScheduleStoreApi = ReturnType<typeof scheduleStoreCreator>;

const initialState = {
  location: null,
  slot: null,
  tz: null,
  selectedCreditIds: new Set<string>(),
};

export const scheduleStoreCreator = (initProps: ScheduleStoreProps) => {
  const getInitialCollectionMethod = (): CollectionMethodType | null => {
    if (initProps.mode === 'phlebotomy-kit') {
      return 'PHLEBOTOMY_KIT';
    }

    return null;
  };

  return createStore<ScheduleStore>()(
    devtools(
      (set, get) => ({
        ...initProps,
        ...initialState,
        collectionMethod: getInitialCollectionMethod(),
        updateCollectionMethod: (collectionMethod) => set({ collectionMethod }),
        updateLocation: (location) => set({ location }),
        updateTz: (tz) => set({ tz }),
        updateSlot: (slot) => set({ slot }),
        reset: () => {
          set({
            ...initialState,
            collectionMethod: getInitialCollectionMethod(),
          });
        },

        updateSelectedCreditIds: (updater) => {
          const prev = get().selectedCreditIds;
          const next =
            typeof updater === 'function'
              ? (updater as (prev: Set<string>) => Set<string>)(prev)
              : updater;
          set({ selectedCreditIds: new Set(next) });
        },

        buildCreateOrderData: (): CreateOrderInput => {
          const slot = get().slot;
          const tz = get().tz;
          const collectionMethod = get().collectionMethod;
          const location = get().location;
          const creditIds = get().selectedCreditIds;

          if (!location?.address)
            throw new Error('No address provided to create order');

          let appointmentType: AppointmentType = 'SCHEDULED';

          if (!location.capabilities.includes('APPOINTMENT_SCHEDULING')) {
            appointmentType = 'UNSCHEDULED';
          }

          const data: CreateOrderInput = {
            creditIds: creditIds.size > 0 ? [...creditIds] : [],
            address: location.address,
            timestamp: slot ? slot.start : undefined,
            timezone: tz ? tz : undefined,
            collectionMethod: collectionMethod ?? undefined,
            appointmentType,
          };

          return data;
        },
      }),
      { name: 'ScheduleStore' },
    ),
  );
};
