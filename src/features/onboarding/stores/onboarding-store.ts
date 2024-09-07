import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  ActiveAddress,
  Address,
  CollectionMethodType,
  HealthcareService,
  Slot,
} from '@/types/api';

export type MembershipType = 'DEFAULT';
export type BloodPackageType = 'BASELINE' | 'ADVANCED';

/* orderId here is updated whenever we create a DRAFT order and want to update it later */
export type ScheduledSlots = {
  /* Slot because user selects slot time */
  blood: {
    orderId: string | null;
    slot: Slot | null;
    timezone: string | null;
  };
  cancer: {
    orderId: string | null;
    slot: Slot | null;
    timezone: string | null;
  };
  /* Address because we DELIVER to this location */
  microbiome: { orderId: string | null; address: Address | null };
  toxin: { orderId: string | null; address: Address | null };
};

type OnboardingStore = {
  serviceAddress: ActiveAddress | null;
  updateServiceAddress: (serviceAddress: ActiveAddress | null) => void;

  isBlocked: boolean /* Primarly used after address step if zip code not supported */;
  updateBlocked: (
    status: boolean,
  ) => void /* Primarly used after address step if zip code not supported */;

  membership: MembershipType | null;
  updateMembership: (membership: MembershipType) => void;
  bloodPackage: BloodPackageType | null;
  updateBloodPackage: (bloodPackage: BloodPackageType) => void;
  collectionMethod: CollectionMethodType | null;
  updateCollectionMethod: (collectionMethod: CollectionMethodType) => void;

  /* Used to keep track of all additional services user orders in configurator */
  additionalServices: HealthcareService[];
  updateAdditionalService: (service: HealthcareService) => void;

  /* Used to keep track of all slots/addresses user selected for services */
  slots: ScheduledSlots;
  updateBloodSlot: (slot: Slot | null) => void;
  updateCancerSlot: (slot: Slot | null) => void;
  updateMicrobiomeAddress: (address: Address | null) => void;
  updateToxinAddress: (address: Address | null) => void;
  updateBloodOrderId: (id: string | null) => void;
  updateCancerOrderId: (id: string | null) => void;
  updateMicrobiomeOrderId: (id: string | null) => void;
  updateToxinOrderId: (id: string | null) => void;
  updateBloodTimezone: (timezone: string) => void;
  updateCancerTimezone: (timezone: string) => void;
};

export const useOnboarding = create<OnboardingStore>()(
  persist(
    (set) => ({
      /*
       *  Different than user's primaryAddress or activeAddress
       *  In this context used as address that user selects to get service
       */
      serviceAddress: null,
      updateServiceAddress: (serviceAddress) => set({ serviceAddress }),
      isBlocked: false,
      updateBlocked: (status) => set({ isBlocked: status }),
      membership: 'DEFAULT',
      updateMembership: (membership) => set({ membership: membership }),
      bloodPackage: 'BASELINE',
      updateBloodPackage: (bloodPackage) => set({ bloodPackage: bloodPackage }),
      collectionMethod: 'IN_LAB',
      updateCollectionMethod: (collectionMethod) =>
        set({ collectionMethod: collectionMethod }),
      additionalServices: [],
      slots: {
        blood: {
          orderId: null,
          slot: null,
          timezone: null,
        },
        cancer: {
          orderId: null,
          slot: null,
          timezone: null,
        },
        microbiome: {
          orderId: null,
          address: null,
        },
        toxin: {
          orderId: null,
          address: null,
        },
      },
      updateBloodSlot: (slot) =>
        set((state) => ({
          slots: {
            ...state.slots,
            blood: {
              slot,
              orderId: state.slots.blood.orderId,
              timezone: state.slots.blood.timezone,
            },
          },
        })),
      updateCancerSlot: (slot) =>
        set((state) => ({
          slots: {
            ...state.slots,
            cancer: {
              slot,
              orderId: state.slots.cancer.orderId,
              timezone: state.slots.cancer.timezone,
            },
          },
        })),
      updateMicrobiomeAddress: (address) =>
        set((state) => ({
          slots: {
            ...state.slots,
            microbiome: {
              address,
              orderId: state.slots.microbiome.orderId,
            },
          },
        })),
      updateToxinAddress: (address) =>
        set((state) => ({
          slots: {
            ...state.slots,
            toxin: {
              address,
              orderId: state.slots.toxin.orderId,
            },
          },
        })),
      updateBloodOrderId: (id) =>
        set((state) => ({
          slots: {
            ...state.slots,
            blood: {
              orderId: id,
              slot: state.slots.blood.slot,
              timezone: state.slots.blood.timezone,
            },
          },
        })),
      updateCancerOrderId: (id) =>
        set((state) => ({
          slots: {
            ...state.slots,
            cancer: {
              orderId: id,
              slot: state.slots.cancer.slot,
              timezone: state.slots.cancer.timezone,
            },
          },
        })),
      updateMicrobiomeOrderId: (id) =>
        set((state) => ({
          slots: {
            ...state.slots,
            microbiome: {
              orderId: id,
              address: state.slots.microbiome.address,
            },
          },
        })),
      updateToxinOrderId: (id) =>
        set((state) => ({
          slots: {
            ...state.slots,
            toxin: { orderId: id, address: state.slots.toxin.address },
          },
        })),
      updateBloodTimezone: (timezone) =>
        set((state) => ({
          slots: {
            ...state.slots,
            blood: {
              orderId: state.slots.blood.orderId,
              slot: state.slots.blood.slot,
              timezone: timezone,
            },
          },
        })),
      updateCancerTimezone: (timezone) =>
        set((state) => ({
          slots: {
            ...state.slots,
            cancer: {
              orderId: state.slots.cancer.orderId,
              slot: state.slots.cancer.slot,
              timezone: timezone,
            },
          },
        })),
      updateAdditionalService: (additionalService: HealthcareService) =>
        set((state) => {
          const exists = state.additionalServices.some(
            (service) => service.id === additionalService.id,
          );

          return {
            additionalServices: exists
              ? state.additionalServices.filter(
                  (service) => service.id !== additionalService.id,
                )
              : [...state.additionalServices, additionalService],
          };
        }),
    }),
    { name: 'onboarding' },
  ),
);
