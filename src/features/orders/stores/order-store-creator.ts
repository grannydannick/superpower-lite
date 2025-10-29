import { ReactNode } from 'react';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { ADVISORY_CALL, GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import { CreateOrderInput, UpdateOrderInput } from '@/features/orders/api';
import {
  CollectionMethodType,
  HealthcareService,
  PhlebotomyLocation,
  OrderStatus,
  Slot,
  AppointmentType,
} from '@/types/api';

export interface OrderStoreProps {
  service: HealthcareService;
  flow: 'full' | 'info';

  onSuccess?: () => void;
  infoFlowBtn?: () => ReactNode;
  preselectedAddOnIds?: string[];
}

export interface OrderStore extends OrderStoreProps {
  collectionMethod: CollectionMethodType | null;
  updateCollectionMethod: (
    collectionMethod: CollectionMethodType | null,
  ) => void;

  addOnIds: Set<string>;
  // react dispatch on purpose to support both store and regular use state in component
  updateAddOnIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  location: PhlebotomyLocation | null;
  updateLocation: (location: PhlebotomyLocation | null) => void;
  tz: string | null;
  updateTz: (tz: string | null) => void;
  slot: Slot | null;
  updateSlot: (slot: Slot | null) => void;
  reset: () => void;
  // Needs to be an optional because not all orders will have informed consent
  informedConsent: boolean | null;
  updateInformedConsent: (agreed: boolean) => void; // Updates consent with agreedToConsent and agreedAt

  buildCreateOrderData: () => CreateOrderInput;
  buildUpdateOrderData: () => UpdateOrderInput;
}

export type OrderStoreApi = ReturnType<typeof orderStoreCreator>;

// Define the initial state
const initialState = {
  location: null,
  slot: null,
  tz: null,
  informedConsent: null,
  addOnIds: new Set<string>(),
};

export const orderStoreCreator = (initProps: OrderStoreProps) => {
  const getInitialCollectionMethod = (): CollectionMethodType | null => {
    if (initProps.service.name === ADVISORY_CALL) {
      return 'AT_HOME';
    }

    if (initProps.service.name === GRAIL_GALLERI_MULTI_CANCER_TEST) {
      return 'PHLEBOTOMY_KIT';
    }

    return null;
  };

  return createStore<OrderStore>()(
    devtools(
      (set, get) => ({
        ...initProps,
        ...initialState,
        collectionMethod: getInitialCollectionMethod(),
        addOnIds: new Set(initProps.preselectedAddOnIds ?? []),
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

        updateInformedConsent: (informedConsent: boolean) =>
          set({ informedConsent }),
        updateAddOnIds: (updater) => {
          const prev = get().addOnIds;
          const next =
            typeof updater === 'function'
              ? (updater as (prev: Set<string>) => Set<string>)(prev)
              : updater;
          set({ addOnIds: new Set(next) });
        },

        buildUpdateOrderData: (): UpdateOrderInput => {
          const slot = get().slot;
          const tz = get().tz;
          const collectionMethod = get().collectionMethod;
          const informedConsent = get().informedConsent;
          const location = get().location;
          const service = get().service;
          const addOnServiceIds = get().addOnIds;

          let appointmentType: AppointmentType | undefined = undefined;

          if (location && service.supportsLabOrder) {
            if (!location.capabilities.includes('APPOINTMENT_SCHEDULING')) {
              appointmentType = 'UNSCHEDULED';
            } else {
              appointmentType = 'SCHEDULED';
            }
          }

          const data: UpdateOrderInput = {
            location: location ? location : {},
            timestamp: slot ? slot.start : undefined,
            timezone: tz ? tz : undefined,
            method: collectionMethod ? collectionMethod : undefined,
            status: OrderStatus.pending,
            addOnServiceIds:
              addOnServiceIds.size > 0 ? [...addOnServiceIds] : undefined,
            appointmentType,
          };

          if (informedConsent) {
            data.informedConsent = { agreedAt: new Date().toISOString() };
          }

          return data;
        },

        buildCreateOrderData: (): CreateOrderInput => {
          const slot = get().slot;
          const tz = get().tz;
          const collectionMethod = get().collectionMethod;
          const informedConsent = get().informedConsent;
          const location = get().location;
          const service = get().service;
          const addOnServiceIds = get().addOnIds;

          let appointmentType: AppointmentType | undefined = undefined;

          if (location && service.supportsLabOrder) {
            if (!location.capabilities.includes('APPOINTMENT_SCHEDULING')) {
              appointmentType = 'UNSCHEDULED';
            } else {
              appointmentType = 'SCHEDULED';
            }
          }

          const data: CreateOrderInput = {
            serviceId: service.id,
            addOnServiceIds:
              addOnServiceIds.size > 0 ? [...addOnServiceIds] : undefined,
            location: location ? location : {},
            // undefined if no slot selected (walk in)
            timestamp: slot ? slot.start : undefined,
            timezone: tz ? tz : undefined,
            method: collectionMethod ?? undefined,
            appointmentType,
          };

          if (informedConsent) {
            data.informedConsent = { agreedAt: new Date().toISOString() };
          }

          return data;
        },
      }),
      { name: 'OrderStore' },
    ),
  );
};
