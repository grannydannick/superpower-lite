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
  numDays?: number;
  showCreateBtn?: boolean;
  isAdvisory?: boolean;
}

export interface SchedulerStore extends SchedulerProps {
  slots: Slot[];
  loading: boolean;
  tz: string;
  fetchSlots: () => Promise<void>;
  selectedDay: Moment | undefined;
  updateSelectedDay: (day: Moment | undefined) => void;
  selectedSlot: Slot | undefined;
  updateSelectedSlot: (slot: Slot | undefined) => void | undefined;
  startRange: Moment | undefined;
  updateStartRange: (date: Moment) => void;
}

export type SchedulerStoreApi = ReturnType<typeof schedulerStoreCreator>;

export const schedulerStoreCreator = (initProps: SchedulerProps) => {
  const DEFAULT_PROPS: SchedulerProps = {
    numDays: initProps.numDays ?? 5,
    onSlotUpdate: initProps.onSlotUpdate,
    showCreateBtn: initProps.showCreateBtn,
    collectionMethod: initProps.collectionMethod,
    address: initProps.address,
    isAdvisory: initProps.isAdvisory ?? false,
  };

  return createStore<SchedulerStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    slots: [],
    tz: moment.tz.guess(),
    loading: false,
    fetchSlots: async () => {
      const state = get();
      const collectionMethod = state.collectionMethod;
      const address = state.address;
      const startRange = state.startRange;
      const isAdvisory = state.isAdvisory;
      set({ loading: true });

      const response: { slots: Slot[]; timezone: string | undefined } =
        await api.post(URL, {
          collectionMethod,
          address,
          start: startRange ? startRange.toDate() : new Date(),
          isAdvisory,
        });

      set({ loading: false, slots: response.slots });

      if (!response.slots.length) return;

      if (!response.timezone) {
        console.warn('Cannot determine timezone');
        return;
      }

      const convertedMoment = moment
        .utc(response.slots[0].start)
        .tz(response.timezone);

      if (moment(convertedMoment).isAfter(startRange)) {
        set({
          startRange: convertedMoment,
          selectedDay: undefined,
          tz: response.timezone,
        });
      }
    },
    selectedDay: undefined,
    updateSelectedDay: (day) =>
      set((state) => ({ ...state, selectedDay: day })),
    selectedSlot: undefined,
    updateSelectedSlot: (slot) =>
      set((state) => ({ ...state, selectedSlot: slot })),
    startRange: moment().tz(moment.tz.guess()),
    updateStartRange: (date) =>
      set((state) => ({ ...state, startRange: date })),
  }));
};
