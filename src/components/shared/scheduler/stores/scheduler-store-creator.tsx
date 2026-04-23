import { TZDateMini, type TZDate } from '@date-fns/tz';
import { isAfter } from 'date-fns';
import { createStore } from 'zustand';

import { api } from '@/lib/api-client';
import { Address, CollectionMethodType, Slot } from '@/types/api';
import { resolveTimeZone } from '@/utils/timezone';

const URL = '/phlebotomy/availability';

export interface SchedulerProps {
  collectionMethod: CollectionMethodType;
  address: Address;
  onSlotUpdate?: (slot: Slot | null, tz: string) => void;
  isAdvisory?: boolean;
  selectedSlot?: Slot | null;
}

export interface SchedulerStore extends SchedulerProps {
  slots: Slot[];
  loading: boolean;
  error: string | null;
  tz: string;
  fetchSlots: () => Promise<void>;
  selectedDay: TZDate | undefined;
  updateSelectedDay: (day: TZDate | undefined) => void;
  startRange: TZDate | undefined;
  updateStartRange: (date: TZDate) => void;
}

export type SchedulerStoreApi = ReturnType<typeof schedulerStoreCreator>;

export const schedulerStoreCreator = (initProps: SchedulerProps) => {
  const initialTimeZone = resolveTimeZone(undefined);
  const DEFAULT_PROPS: SchedulerProps = {
    onSlotUpdate: initProps.onSlotUpdate,
    collectionMethod: initProps.collectionMethod,
    address: initProps.address,
    isAdvisory: initProps.isAdvisory ?? false,
  };

  return createStore<SchedulerStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    slots: [],
    tz: initialTimeZone,
    loading: false,
    error: null,
    fetchSlots: async () => {
      const state = get();
      const collectionMethod = state.collectionMethod;
      const address = state.address;
      const startRange = state.startRange;
      const isAdvisory = state.isAdvisory;
      set({ loading: true, error: null });

      try {
        const start = startRange ? new Date(startRange.getTime()) : new Date();

        const response: { slots: Slot[]; timezone?: string } = await api.post(
          URL,
          {
            collectionMethod,
            address,
            start,
            isAdvisory,
          },
        );

        const tz = resolveTimeZone(response.timezone ?? state.tz);

        // find earliest slot to set initial startRange
        const allSlots = response.slots;
        let newStartRange = state.startRange
          ? new TZDateMini(state.startRange.getTime(), tz)
          : undefined;

        if (allSlots.length > 0) {
          let earliestSlot = allSlots[0];
          let earliestStartTime = new Date(earliestSlot.start).getTime();

          for (const slot of allSlots) {
            const slotStartTime = new Date(slot.start).getTime();

            if (Number.isNaN(slotStartTime)) {
              continue;
            }

            if (
              Number.isNaN(earliestStartTime) ||
              slotStartTime < earliestStartTime
            ) {
              earliestSlot = slot;
              earliestStartTime = slotStartTime;
            }
          }

          const earliestStart = new Date(earliestSlot.start);
          if (!Number.isNaN(earliestStart.getTime())) {
            const earliestInTz = new TZDateMini(earliestStart.getTime(), tz);

            if (newStartRange == null || isAfter(earliestInTz, newStartRange)) {
              newStartRange = earliestInTz;
            }
          }
        }

        set({
          loading: false,
          slots: response.slots,
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
