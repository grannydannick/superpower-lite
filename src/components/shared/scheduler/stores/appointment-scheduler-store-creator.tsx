import { TZDateMini, type TZDate } from '@date-fns/tz';
import { isAfter, addDays } from 'date-fns';
import { createStore } from 'zustand';

import { api } from '@/lib/api-client';
import { ConsultSlot } from '@/types/api';
import { resolveTimeZone } from '@/utils/timezone';

export interface AppointmentSchedulerProps {
  onSlotUpdate?: (slot: ConsultSlot | null, tz: string) => void;
  selectedSlot?: ConsultSlot | null;
}

export interface AppointmentSchedulerStore extends AppointmentSchedulerProps {
  slots: ConsultSlot[];
  loading: boolean;
  error: string | null;
  tz: string;
  fetchSlots: () => Promise<void>;
  selectedDay: TZDate | undefined;
  updateSelectedDay: (day: TZDate | undefined) => void;
  startRange: TZDate | undefined;
  updateStartRange: (date: TZDate) => void;
}

export type AppointmentSchedulerStoreApi = ReturnType<
  typeof appointmentSchedulerStoreCreator
>;

export const appointmentSchedulerStoreCreator = (
  initProps: AppointmentSchedulerProps,
) => {
  const initialTimeZone = resolveTimeZone(undefined);

  return createStore<AppointmentSchedulerStore>()((set, get) => ({
    onSlotUpdate: initProps.onSlotUpdate,
    selectedSlot: initProps.selectedSlot ?? null,
    slots: [],
    tz: initialTimeZone,
    loading: false,
    error: null,
    fetchSlots: async () => {
      const state = get();
      const startRange = state.startRange;
      const start = startRange ? new Date(startRange.getTime()) : new Date();

      const from = start.toISOString();
      const to = addDays(start, 7).toISOString();

      set({ loading: true, error: null, slots: [] });

      try {
        const response: { slots: ConsultSlot[] } = await api.get(
          `/consults/cal/slots?from=${from}&to=${to}`,
        );

        const tz = resolveTimeZone(state.tz);
        const allSlots = response.slots;
        let newStartRange = state.startRange
          ? new TZDateMini(state.startRange.getTime(), tz)
          : undefined;

        if (allSlots.length > 0) {
          let earliestStartTime: number | null = null;

          for (const slot of allSlots) {
            const slotStartTime = new Date(slot.start).getTime();
            if (Number.isNaN(slotStartTime)) continue;

            if (
              earliestStartTime === null ||
              slotStartTime < earliestStartTime
            ) {
              earliestStartTime = slotStartTime;
            }
          }

          if (earliestStartTime !== null) {
            const earliestInTz = new TZDateMini(earliestStartTime, tz);
            if (newStartRange == null || isAfter(earliestInTz, newStartRange)) {
              newStartRange = earliestInTz;
            }
          }
        }

        set({
          loading: false,
          slots: allSlots,
          tz,
          startRange: newStartRange,
        });
      } catch {
        set({
          loading: false,
          error: 'Failed to load available slots. Please try again.',
        });
      }
    },
    selectedDay: undefined,
    updateSelectedDay: (day) => set({ selectedDay: day }),
    startRange: new TZDateMini(Date.now(), initialTimeZone),
    updateStartRange: (date) => {
      set({ startRange: date, selectedDay: undefined });
      get().fetchSlots();
    },
  }));
};
