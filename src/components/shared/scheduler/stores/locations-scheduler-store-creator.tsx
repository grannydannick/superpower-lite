import moment, { Moment } from 'moment';
import 'moment-timezone';
import { createStore } from 'zustand';

import { api } from '@/lib/api-client';
import { PhlebotomyLocation, Slot } from '@/types/api';

const URL = '/phlebotomy/search';

export interface LocationsSchedulerProps {
  onSelectionChange?: (
    location: PhlebotomyLocation | null,
    slot: Slot | null,
    tz: string,
  ) => void;
  selectedLocation?: PhlebotomyLocation | null;
  selectedSlot?: Slot | null;
}

export interface LocationsSchedulerStore extends LocationsSchedulerProps {
  locations: PhlebotomyLocation[];
  loading: boolean;
  error: string | null;
  tz: string;
  postalCode: string | undefined;
  fetchLocations: (postalCode: string) => Promise<void>;
  selectedDay: Moment | undefined;
  updateSelectedDay: (day: Moment | undefined) => void;
  startRange: Moment | undefined;
  updateStartRange: (date: Moment) => void;
  getAllSlots: () => Slot[];
}

export type LocationsSchedulerStoreApi = ReturnType<
  typeof locationsSchedulerStoreCreator
>;

export const locationsSchedulerStoreCreator = (
  initProps: LocationsSchedulerProps,
) => {
  return createStore<LocationsSchedulerStore>()((set, get) => ({
    onSelectionChange: initProps.onSelectionChange,
    selectedLocation: initProps.selectedLocation ?? null,
    selectedSlot: initProps.selectedSlot ?? null,
    locations: [],
    loading: false,
    error: null,
    tz: moment.tz.guess(),
    postalCode: '',
    selectedDay: undefined,
    startRange: moment().tz(moment.tz.guess()),
    fetchLocations: async (postalCode: string) => {
      const state = get();

      const startRange = state.startRange;
      const start = startRange ? startRange.format('YYYY-MM-DD') : new Date();

      state.onSelectionChange?.(null, null, state.tz);

      set({ loading: true, error: null, postalCode });

      try {
        const response: { locations: PhlebotomyLocation[]; timezone?: string } =
          await api.get(`${URL}?postalCode=${postalCode}&start=${start}`);

        const tz = response.timezone ?? get().tz;

        // find earliest slot to set initial startRange
        const allSlots = response.locations.flatMap((loc) => loc.slots);
        let newStartRange = get().startRange;

        if (allSlots.length > 0) {
          const earliestSlot = allSlots.reduce((min, slot) => {
            return moment(slot.start).isBefore(moment(min.start)) ? slot : min;
          }, allSlots[0]);

          const earliestMoment = moment.utc(earliestSlot.start).tz(tz);
          if (earliestMoment.isAfter(newStartRange)) {
            newStartRange = earliestMoment;
          }
        }

        set({
          loading: false,
          locations: response.locations,
          tz,
          startRange: newStartRange,
        });
      } catch {
        set({
          loading: false,
          error: 'Failed to load locations. Please try again.',
        });
      }
    },
    updateSelectedDay: (day) => set({ selectedDay: day }),
    updateStartRange: (date) => {
      set({ startRange: date, selectedDay: undefined });
      const postalCode = get().postalCode;
      if (postalCode) {
        get().fetchLocations(postalCode);
      }
    },
    getAllSlots: () => {
      return get().locations.flatMap((loc) => loc.slots);
    },
  }));
};
