import { TZDateMini, type TZDate, tzName } from '@date-fns/tz';
import { isSameDay } from 'date-fns';

import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { ConsultSlot } from '@/types/api';

import { SchedulerTimeSlot } from './scheduler-time-slot';

const TIME_SKELETON_KEYS = ['t1', 't2', 't3', 't4'];

interface GroupedSchedulerTimesProps {
  slots: ConsultSlot[];
  selectedDay?: TZDate;
  selectedSlot?: ConsultSlot | null;
  loading: boolean;
  startRange?: TZDate;
  tz: string;
  onSlotSelect: (slot: ConsultSlot) => void;
}

export const GroupedSchedulerTimes = ({
  slots,
  selectedDay,
  selectedSlot,
  loading,
  startRange,
  tz,
  onSlotSelect,
}: GroupedSchedulerTimesProps) => {
  if (selectedDay == null) return null;

  const daySlots: ConsultSlot[] = [];
  for (const slot of slots) {
    const slotStart = new TZDateMini(slot.start, tz);
    if (isSameDay(selectedDay, slotStart)) {
      daySlots.push(slot);
    }
  }

  if (!loading && daySlots.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed px-3 py-10">
        <Body1 className="text-zinc-500">No times found.</Body1>
      </div>
    );
  }

  let timeZoneAbbreviation: string | null = null;
  if (startRange != null && !loading) {
    try {
      timeZoneAbbreviation = tzName(tz, startRange, 'short');
    } catch {
      timeZoneAbbreviation = null;
    }
  }

  // Group by practitioner
  const grouped = new Map<string, ConsultSlot[]>();
  for (const slot of daySlots) {
    const name = slot.practitionerName || 'Available';
    const existing = grouped.get(name) ?? [];
    existing.push(slot);
    grouped.set(name, existing);
  }

  if (loading) {
    return (
      <>
        <Skeleton className="mb-2 h-5 w-full max-w-[230px] md:h-6" />
        <div className="flex flex-nowrap gap-2 overflow-x-auto sm:flex-wrap">
          {TIME_SKELETON_KEYS.map((key) => (
            <Skeleton className="h-[46px] w-full rounded-xl" key={key} />
          ))}
        </div>
      </>
    );
  }

  const groupEntries = [...grouped.entries()];

  return (
    <div className="space-y-6">
      {groupEntries.map(([practitionerName, practitionerSlots]) => {
        const groupOwnsSelection = practitionerSlots.some(
          (s) => s.practitionerId === selectedSlot?.practitionerId,
        );

        return (
          <div key={practitionerName} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Body1 className="text-sm font-medium sm:text-base">
                {practitionerName}
              </Body1>
              {timeZoneAbbreviation ? (
                <Body1 className="text-sm text-zinc-500 sm:text-base">
                  {timeZoneAbbreviation}
                </Body1>
              ) : null}
            </div>
            <div className="flex flex-nowrap gap-2 overflow-x-auto sm:flex-wrap">
              {practitionerSlots.map((slot) => (
                <SchedulerTimeSlot
                  key={`${slot.practitionerId}-${slot.start}`}
                  timeSlot={slot}
                  selectedSlot={groupOwnsSelection ? selectedSlot : null}
                  tz={tz}
                  onSlotSelect={onSlotSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
