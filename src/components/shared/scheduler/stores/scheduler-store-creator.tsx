import moment, { Moment } from 'moment';
import 'moment-timezone';
import { createStore } from 'zustand';

import { api } from '@/lib/api-client';
import {
  Address,
  CollectionMethodType,
  HealthcareService,
  Slot,
} from '@/types/api';

const URL = '/phlebotomy/availability';

export interface SchedulerProps {
  collectionMethod: CollectionMethodType;
  address: Address;
  service: HealthcareService;
  onSlotUpdate?: (slot: Slot | null, tz: string) => void;
  numDays?: number;
  showCreateBtn?: boolean;
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
    service: initProps.service,
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
      const service = state.service;
      const startRange = state.startRange;
      set({ loading: true });
      const response: { slots: Slot[]; timezone: string | undefined } =
        await api.post(URL, {
          collectionMethod,
          address,
          serviceId: service.id,
          start: startRange ? startRange.toDate() : new Date(),
        });

      set({ loading: false, slots: response.slots });

      if (!response.slots.length) return;

      // Always set timezone if provided
      if (response.timezone) {
        set({ tz: response.timezone });
      }

      const tz = response.timezone || get().tz;

      const convertedMoment = moment.utc(response.slots[0].start).tz(tz);
      if (startRange && moment(convertedMoment).isAfter(startRange)) {
        const currentSelectedDay = get().selectedDay;

        // if user had selected a day already and it's before the new range,
        // move selection to the first available day. Otherwise, keep it.
        const nextSelectedDay = currentSelectedDay
          ? currentSelectedDay.isBefore(convertedMoment, 'day')
            ? convertedMoment
            : currentSelectedDay
          : undefined;

        set({
          startRange: convertedMoment,
          selectedDay: nextSelectedDay,
        });
      }

      // as a fallback - ensure selectedDay/selectedSlot are valid with new data
      const stateAfter = get();
      const currentSelectedDay = stateAfter.selectedDay;
      const currentSelectedSlot = stateAfter.selectedSlot;
      const allSlots = response.slots;

      const toMoment = (s: Slot) => moment(s.start).tz(tz);

      let finalSelectedDay = currentSelectedDay;

      if (currentSelectedDay) {
        const hasSlotsOnSelected = allSlots.some((s) =>
          currentSelectedDay.isSame(toMoment(s), 'day'),
        );
        if (!hasSlotsOnSelected) {
          const nextDay = allSlots
            .map((s) => toMoment(s))
            .filter((m) => m.isSameOrAfter(currentSelectedDay, 'day'))
            .sort((a, b) => a.valueOf() - b.valueOf())[0];
          if (nextDay) {
            finalSelectedDay = nextDay.clone();
            set({ selectedDay: finalSelectedDay });
          }
        }
      }

      // preselect earliest slot on the chosen day if needed
      if (finalSelectedDay) {
        const daySlots = allSlots
          .filter((s) => finalSelectedDay?.isSame(toMoment(s), 'day'))
          .sort((a, b) => toMoment(a).valueOf() - toMoment(b).valueOf());

        if (daySlots.length) {
          const currentSlotMatchesDay = currentSelectedSlot
            ? finalSelectedDay.isSame(toMoment(currentSelectedSlot), 'day')
            : false;
          if (!currentSelectedSlot || !currentSlotMatchesDay) {
            set({ selectedSlot: daySlots[0] });
          }
        } else {
          set({ selectedSlot: undefined });
        }
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
