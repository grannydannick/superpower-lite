import { TZDateMini, type TZDate } from '@date-fns/tz';
import { format, isAfter } from 'date-fns';
import { createStore } from 'zustand';

import { api } from '@/lib/api-client';
import { PhlebotomyLocation, Slot } from '@/types/api';
import { resolveTimeZone } from '@/utils/timezone';

const URL = '/phlebotomy/search';

export interface LocationsSchedulerProps {
  onSelectionChange?: (
    location: PhlebotomyLocation | null,
    slot: Slot | null,
    tz: string,
  ) => void;
  selectedLocation?: PhlebotomyLocation | null;
  selectedSlot?: Slot | null;
  scheduledOnly?: boolean;
}

export interface LocationsSchedulerStore extends LocationsSchedulerProps {
  locations: PhlebotomyLocation[];
  loading: boolean;
  error: string | null;
  tz: string;
  postalCode: string | undefined;
  scheduledOnly: boolean;
  fetchLocations: (postalCode: string) => Promise<void>;
  selectedDay: TZDate | undefined;
  updateSelectedDay: (day: TZDate | undefined) => void;
  startRange: TZDate | undefined;
  updateStartRange: (date: TZDate) => void;
  getAllSlots: () => Slot[];
}

export type LocationsSchedulerStoreApi = ReturnType<
  typeof locationsSchedulerStoreCreator
>;

export const locationsSchedulerStoreCreator = (
  initProps: LocationsSchedulerProps,
) => {
  const initialTimeZone = resolveTimeZone(undefined);

  return createStore<LocationsSchedulerStore>()((set, get) => ({
    onSelectionChange: initProps.onSelectionChange,
    selectedLocation: initProps.selectedLocation ?? null,
    selectedSlot: initProps.selectedSlot ?? null,
    scheduledOnly: initProps.scheduledOnly ?? false,
    locations: [],
    loading: false,
    error: null,
    tz: initialTimeZone,
    postalCode: '',
    selectedDay: undefined,
    startRange: new TZDateMini(Date.now(), initialTimeZone),
    fetchLocations: async (postalCode: string) => {
      const state = get();

      const startRange = state.startRange;
      const start = startRange
        ? format(startRange, 'yyyy-MM-dd')
        : format(new TZDateMini(Date.now(), state.tz), 'yyyy-MM-dd');

      state.onSelectionChange?.(null, null, state.tz);

      set({ loading: true, error: null, postalCode, locations: [] });

      try {
        const scheduledOnly = get().scheduledOnly;
        const scheduledOnlyParam = scheduledOnly ? '&scheduledOnly=true' : '';
        const response: { locations: PhlebotomyLocation[]; timezone?: string } =
          await api.get(
            `${URL}?postalCode=${postalCode}&start=${start}${scheduledOnlyParam}`,
          );

        const tz = resolveTimeZone(response.timezone ?? get().tz);

        // find earliest slot to set initial startRange
        const previousStartRange = get().startRange;
        let newStartRange = previousStartRange
          ? new TZDateMini(previousStartRange.getTime(), tz)
          : undefined;

        let earliestStartTime: number | null = null;

        for (const location of response.locations) {
          for (const slot of location.slots) {
            const slotStartTime = new Date(slot.start).getTime();
            if (Number.isNaN(slotStartTime)) continue;

            if (
              earliestStartTime === null ||
              slotStartTime < earliestStartTime
            ) {
              earliestStartTime = slotStartTime;
            }
          }
        }

        if (earliestStartTime !== null) {
          const earliestInTz = new TZDateMini(earliestStartTime, tz);

          if (newStartRange == null || isAfter(earliestInTz, newStartRange)) {
            newStartRange = earliestInTz;
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
      const allSlots: Slot[] = [];

      for (const loc of get().locations) {
        for (const slot of loc.slots) {
          allSlots.push(slot);
        }
      }

      return allSlots;
    },
  }));
};
