import React, { useEffect } from 'react';

import { Body1 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { ConsultSlot } from '@/types/api';

import { SchedulerDays, SchedulerHeading } from './components';
import { GroupedSchedulerTimes } from './components/grouped-scheduler-times';
import {
  AppointmentSchedulerStoreProvider,
  useAppointmentScheduler,
} from './stores/appointment-scheduler';

interface Props {
  onSlotUpdate?: (slot: ConsultSlot | null, tz: string) => void;
  selectedSlot?: ConsultSlot | null;
  className?: string;
}

export function AppointmentScheduler(props: Props) {
  const { className, selectedSlot, ...rest } = props;

  return (
    <AppointmentSchedulerStoreProvider {...rest}>
      <AppointmentSchedulerConsumer
        className={className}
        selectedSlot={selectedSlot}
      />
    </AppointmentSchedulerStoreProvider>
  );
}

function AppointmentSchedulerConsumer({
  className,
  selectedSlot,
}: {
  className?: string;
  selectedSlot?: ConsultSlot | null;
}) {
  const {
    slots,
    fetchSlots,
    startRange,
    loading,
    error,
    tz,
    selectedDay,
    updateSelectedDay,
    updateStartRange,
    onSlotUpdate,
  } = useAppointmentScheduler((s) => s);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleSlotSelect = (slot: ConsultSlot) => {
    onSlotUpdate?.(slot, tz);
  };

  const handleSelectionClear = () => {
    updateSelectedDay(undefined);
    onSlotUpdate?.(null, tz);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 px-3 py-10">
        <Body1 className="text-red-600">{error}</Body1>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-8', className)}>
      <div className="space-y-6">
        <SchedulerHeading
          startRange={startRange}
          tz={tz}
          loading={loading}
          onRangeChange={updateStartRange}
          onSelectionClear={handleSelectionClear}
        />
        <SchedulerDays
          slots={slots}
          startRange={startRange}
          loading={loading}
          selectedDay={selectedDay}
          tz={tz}
          onDaySelect={updateSelectedDay}
        />
      </div>
      <div>
        <GroupedSchedulerTimes
          slots={slots}
          selectedDay={selectedDay}
          selectedSlot={selectedSlot}
          loading={loading}
          startRange={startRange}
          tz={tz}
          onSlotSelect={handleSlotSelect}
        />
      </div>
    </div>
  );
}
