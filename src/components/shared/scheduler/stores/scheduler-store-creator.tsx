import moment, { Moment } from 'moment';
import 'moment-timezone';
import { createStore } from 'zustand';

import { api } from '@/lib/api-client';
import { Address, CollectionMethodType, Slot } from '@/types/api';

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
  selectedDay: Moment | undefined;
  updateSelectedDay: (day: Moment | undefined) => void;
  startRange: Moment | undefined;
  updateStartRange: (date: Moment) => void;
}

export type SchedulerStoreApi = ReturnType<typeof schedulerStoreCreator>;

export const schedulerStoreCreator = (initProps: SchedulerProps) => {
  const DEFAULT_PROPS: SchedulerProps = {
    onSlotUpdate: initProps.onSlotUpdate,
    collectionMethod: initProps.collectionMethod,
    address: initProps.address,
    isAdvisory: initProps.isAdvisory ?? false,
  };

  return createStore<SchedulerStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    slots: [],
    tz: moment.tz.guess(),
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
        const response: { slots: Slot[]; timezone: string | undefined } =
          await api.post(URL, {
            collectionMethod,
            address,
            start: startRange ? startRange.toDate() : new Date(),
            isAdvisory,
          });

        const tz = response.timezone ?? state.tz;

        // find earliest slot to set initial startRange
        const allSlots = response.slots;
        let newStartRange = state.startRange;

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
    updateSelectedDay: (day) =>
      set((state) => ({ ...state, selectedDay: day })),
    startRange: moment().tz(moment.tz.guess()),
    updateStartRange: (date) => {
      set({ startRange: date, selectedDay: undefined });
      get().fetchSlots();
    },
  }));
};
