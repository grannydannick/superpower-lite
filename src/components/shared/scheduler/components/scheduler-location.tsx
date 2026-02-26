import { TZDateMini } from '@date-fns/tz';
import { format } from 'date-fns';
import { CornerUpRight } from 'lucide-react';
import React, { useState } from 'react';

import { Body2, Body1, Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation, Slot } from '@/types/api';
import { formatDistanceText } from '@/utils/format-distance';

import { useLocationsScheduler } from '../stores/locations-scheduler';

import { WalkInNotice } from './walk-in-notice';

interface SchedulerLocationProps {
  location: PhlebotomyLocation;
  selectedLocation?: PhlebotomyLocation | null;
  selectedSlot?: Slot | null;
}

export const SchedulerLocation = ({
  location,
  selectedLocation,
  selectedSlot,
}: SchedulerLocationProps) => {
  const { tz, onSelectionChange } = useLocationsScheduler((s) => s);
  const [showWalkIn, setShowWalkIn] = useState(false);

  const isLocationSelected =
    selectedLocation?.address.id === location.address.id;
  const isWalkIn = !location.capabilities.includes('APPOINTMENT_SCHEDULING');

  const streetAddress = location.address.line.join(', ');
  const city = location.address.city;

  const locationDetails = `${streetAddress}, ${city}`;

  const handleSlotClick = (slot: Slot) => {
    if (onSelectionChange == null) return;

    if (isLocationSelected && selectedSlot?.start === slot.start) {
      onSelectionChange(null, null, tz);
      return;
    }

    // if walk in just set location selected
    if (isWalkIn) {
      setShowWalkIn(true);
    }

    onSelectionChange(location, slot, tz);
  };

  const formatTimeSlot = (slot: Slot) => {
    const start = new TZDateMini(slot.start, tz);
    const end = new TZDateMini(slot.end, tz);

    return `${format(start, 'h:mmaaa')} — ${format(end, 'h:mmaaa')}`;
  };

  const slotNodes: React.ReactElement[] = [];
  for (const slot of location.slots) {
    const isSelected = isLocationSelected && selectedSlot?.start === slot.start;

    slotNodes.push(
      <div
        key={slot.start}
        className={cn(
          'cursor-pointer text-nowrap rounded-xl border bg-white px-3 py-2 transition-all duration-200',
          isSelected
            ? 'border-vermillion-900 shadow-lg shadow-vermillion-900/10'
            : 'hover:border-zinc-300',
        )}
        onClick={() => handleSlotClick(slot)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSlotClick(slot);
          }
        }}
      >
        <Body2>{formatTimeSlot(slot)}</Body2>
      </div>,
    );
  }

  return (
    <div className="space-y-4 rounded-[20px] border bg-white p-3">
      <WalkInNotice
        location={location}
        open={showWalkIn}
        setOpen={setShowWalkIn}
      />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1.5">
          <Body1 className="font-medium">{location.name}</Body1>

          <div className="flex gap-2">
            <Body2 className="text-secondary">
              {formatDistanceText(location.distance)}
            </Body2>
            <CornerUpRight className="size-4 text-secondary" />
          </div>
        </div>
        <Body2 className="text-secondary">{locationDetails}</Body2>
        {isWalkIn ? (
          <Body3 className="text-secondary">
            Walk-in only during business hours. Wait time ~15-30min.
          </Body3>
        ) : null}
      </div>

      {location.slots.length > 0 && (
        <div>
          <div className="flex flex-nowrap gap-2 overflow-x-auto sm:flex-wrap">
            {slotNodes}
          </div>
        </div>
      )}

      {location.slots.length === 0 && (
        <div>
          <Body2 className="text-zinc-400">No available times</Body2>
        </div>
      )}
    </div>
  );
};
