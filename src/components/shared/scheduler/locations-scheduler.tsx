import { TZDateMini } from '@date-fns/tz';
import { Map, Marker } from '@vis.gl/react-google-maps';
import { isSameDay } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Body1 } from '@/components/ui/typography';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation, Slot } from '@/types/api';

import { SchedulerDays, SchedulerHeading } from './components';
import { SchedulerLocation } from './components/scheduler-location';
import {
  LocationsSchedulerStoreProvider,
  useLocationsScheduler,
} from './stores/locations-scheduler';

const LOCATIONS_SCHEDULER_DAY_SKELETON_KEYS = [
  'day-1',
  'day-2',
  'day-3',
  'day-4',
  'day-5',
  'day-6',
  'day-7',
];

const LOCATIONS_SCHEDULER_LOCATION_SKELETON_KEYS = ['loc-1', 'loc-2', 'loc-3'];

const DEFAULT_MAP_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_MAP_ZOOM = 4;

function LocationsSchedulerLoader({ className }: { className?: string }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getMessage = () => {
    if (elapsedSeconds < 5) {
      return 'Checking real time availability';
    } else if (elapsedSeconds < 12) {
      return 'Connecting to lab scheduling system... this can take a moment for most accurate times';
    } else if (elapsedSeconds < 20) {
      return "Still working... we're pulling live availability directly from the lab";
    } else {
      return 'Almost there. Thanks for your patience, live bookings take a bit longer but ensures the time you pick is actually available';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <TextShimmer
        className="text-sm [--base-color:theme(colors.zinc.600)] [--base-gradient-color:theme(colors.zinc.200)]"
        duration={1.2}
      >
        {getMessage()}
      </TextShimmer>
      <div className="flex gap-2">
        {LOCATIONS_SCHEDULER_DAY_SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-[70px] w-full rounded-xl" />
        ))}
      </div>
      {LOCATIONS_SCHEDULER_LOCATION_SKELETON_KEYS.map((key) => (
        <Skeleton key={key} className="h-[180px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

interface Props {
  postalCode: string;
  onSelectionChange?: (
    location: PhlebotomyLocation | null,
    slot: Slot | null,
    tz: string,
  ) => void;
  selectedLocation?: PhlebotomyLocation | null;
  selectedSlot?: Slot | null;
  className?: string;
}

export function LocationsScheduler(props: Props) {
  const {
    postalCode,
    onSelectionChange,
    selectedLocation,
    selectedSlot,
    className,
  } = props;

  if (postalCode.length !== 5) return null;

  return (
    <LocationsSchedulerStoreProvider
      onSelectionChange={onSelectionChange}
      selectedLocation={selectedLocation}
      selectedSlot={selectedSlot}
    >
      <LocationsSchedulerConsumer
        postalCode={postalCode}
        selectedLocation={selectedLocation}
        selectedSlot={selectedSlot}
        className={className}
      />
    </LocationsSchedulerStoreProvider>
  );
}

function LocationsSchedulerConsumer({
  postalCode,
  selectedLocation,
  selectedSlot,
  className,
}: {
  postalCode: string;
  selectedLocation?: PhlebotomyLocation | null;
  selectedSlot?: Slot | null;
  className?: string;
}) {
  const {
    locations,
    loading,
    error,
    fetchLocations,
    tz,
    selectedDay,
    updateSelectedDay,
    startRange,
    updateStartRange,
    onSelectionChange,
  } = useLocationsScheduler((s) => s);

  useEffect(() => {
    if (postalCode === '') return;
    fetchLocations(postalCode);
  }, [postalCode, fetchLocations]);

  const allSlots: Slot[] = [];
  for (const location of locations) {
    for (const slot of location.slots) {
      allSlots.push(slot);
    }
  }

  // locations to only show those with slots on the selected day
  const filteredLocations = useMemo(() => {
    if (selectedDay == null) return [];

    const nextLocations: PhlebotomyLocation[] = [];

    for (const location of locations) {
      const daySlots: Slot[] = [];

      for (const slot of location.slots) {
        const slotStart = new TZDateMini(slot.start, tz);
        if (isSameDay(selectedDay, slotStart)) {
          daySlots.push(slot);
        }
      }

      if (daySlots.length === 0) continue;
      nextLocations.push({ ...location, slots: daySlots });
    }

    return nextLocations;
  }, [locations, selectedDay, tz]);

  const handleSelectionClear = () => {
    updateSelectedDay(undefined);
    onSelectionChange?.(null, null, tz);
  };

  if (loading) {
    return <LocationsSchedulerLoader className={className} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 px-3 py-10">
        <Body1 className="text-red-600">{error}</Body1>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed px-3 py-10">
        <Body1 className="text-center text-secondary">
          {env.IN_LAB_DISABLED
            ? "In-lab locations are temporarily unavailable. We're working to get back online shortly. At-home visits are available now."
            : 'No locations found for this zip code.'}
        </Body1>
      </div>
    );
  }

  const locationRefs: Array<{ lng: number; lat: number }> = [];

  for (const l of locations) {
    if (l.lng != null && l.lat != null) {
      locationRefs.push({ lng: l.lng, lat: l.lat });
    }
  }

  const locationCenter =
    locationRefs.length > 0
      ? { lat: locationRefs[0].lat, lng: locationRefs[0].lng }
      : undefined;
  const hasLocationCenter = locationCenter != null;
  const mapCenter = locationCenter ?? DEFAULT_MAP_CENTER;
  const mapZoom = hasLocationCenter ? 12 : DEFAULT_MAP_ZOOM;

  const locationMarkerNodes: React.ReactElement[] = [];
  for (const lr of locationRefs) {
    locationMarkerNodes.push(
      <Marker
        key={`${lr.lat}-${lr.lng}`}
        position={{ lat: lr.lat, lng: lr.lng }}
      />,
    );
  }

  const filteredLocationNodes: React.ReactElement[] = [];
  for (const location of filteredLocations) {
    filteredLocationNodes.push(
      <SchedulerLocation
        key={location.address.id}
        location={location}
        selectedLocation={selectedLocation}
        selectedSlot={selectedSlot}
      />,
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-6">
        <SchedulerHeading
          startRange={startRange}
          tz={tz}
          loading={loading}
          onRangeChange={updateStartRange}
          onSelectionClear={handleSelectionClear}
        />
        <SchedulerDays
          slots={allSlots}
          startRange={startRange}
          loading={loading}
          selectedDay={selectedDay}
          tz={tz}
          onDaySelect={updateSelectedDay}
        />
      </div>

      {selectedDay != null && (
        <div className="space-y-6">
          <div className="space-y-4">
            <Body1 className="text-secondary">
              Available locations near you
            </Body1>
            <div className="h-[188px] w-full overflow-hidden rounded-2xl">
              <Map
                defaultZoom={mapZoom}
                gestureHandling="greedy"
                disableDefaultUI
                defaultCenter={mapCenter}
                className="size-full"
              >
                {locationMarkerNodes}
              </Map>
            </div>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed px-3 py-10">
              <Body1 className="text-secondary">
                No locations with available slots on this day.
              </Body1>
            </div>
          ) : (
            <div className="space-y-3">{filteredLocationNodes}</div>
          )}
        </div>
      )}
    </div>
  );
}
