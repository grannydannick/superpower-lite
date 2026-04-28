import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRightIcon,
  Calendar,
  MapPin,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Button } from '@/components/ui/button';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import { CardSkeleton } from '@/features/homepage/components/card-skeleton';
import { HomepageCard } from '@/features/homepage/components/homepage-card';
import { useCurrentLabOrders } from '@/features/orders/hooks';
import { useNowMs } from '@/hooks/use-now-ms';
import { Address } from '@/types/api';

import { LabOrderProgress } from './lab-order-progress';
import { PreparationTipsCarousel } from './preparation-tips';

const getDaysUntilAppointment = (timestamp?: string): number | null => {
  if (!timestamp) return null;
  const now = new Date();
  const appointmentDate = new Date(timestamp);
  if (Number.isNaN(appointmentDate.getTime())) return null;

  if (
    now.getFullYear() === appointmentDate.getFullYear() &&
    now.getMonth() === appointmentDate.getMonth() &&
    now.getDate() === appointmentDate.getDate()
  ) {
    return 0;
  }

  const diff =
    (appointmentDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  return diff > 0 ? Math.ceil(diff) : Math.floor(diff);
};

/**
 * Validates if a location has sufficient information for map navigation
 */
const isValidAddress = (address?: Address): boolean => {
  if (!address) return false;

  const { line, city, state: _state, postalCode } = address;
  const hasAddressLine = line && line.length > 0 && line[0];
  const hasCityOrPostal = city || postalCode;

  return Boolean(hasAddressLine && hasCityOrPostal);
};

export const LabOrderCard = () => {
  const { activeLabOrders, isError, isPending } = useCurrentLabOrders();
  const nowMs = useNowMs();
  const [currentIndex, setCurrentIndex] = useState(0);

  /**
   * Callback to open location in maps
   * Builds a basic address string and opens it in Google Maps
   */
  const handleOpenInMaps = useCallback((address?: Address) => {
    if (!address) return;

    // Build address string from components
    const addressParts = [
      ...(address.line || []),
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);

    const addressString = addressParts.join(', ');
    const query = addressString;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  }, []);

  if (isPending) return <CardSkeleton />;
  if (isError) return null;

  const totalAppointments = activeLabOrders.length;
  const safeIndex = Math.min(currentIndex, Math.max(totalAppointments - 1, 0));
  const activeLabOrder = activeLabOrders[safeIndex];
  if (!activeLabOrder) {
    return null;
  }

  const hasMultiple = totalAppointments > 1;

  const serviceNames = activeLabOrder.orders
    .map((o) => o.serviceName)
    .join(', ');

  const daysUntil = getDaysUntilAppointment(activeLabOrder.startTimestamp);

  let appointmentStatus: 'processing' | 'scheduled' = 'scheduled';
  if (activeLabOrder.startTimestamp) {
    const start = new Date(activeLabOrder.startTimestamp);
    if (!Number.isNaN(start.getTime())) {
      const oneHourAfter = start.getTime() + 60 * 60 * 1000;
      if (oneHourAfter < nowMs) {
        appointmentStatus = 'processing';
      }
    }
  }

  const hasValidLocation = isValidAddress(activeLabOrder.address);
  const slot =
    activeLabOrder.startTimestamp && activeLabOrder.endTimestamp
      ? {
          start: activeLabOrder.startTimestamp,
          end: activeLabOrder.endTimestamp,
        }
      : null;

  const appointmentNoun =
    hasMultiple && appointmentStatus !== 'processing'
      ? safeIndex === 0
        ? 'Your first appointment'
        : 'Your next appointment'
      : 'Your appointment';

  let headerMessage = `${appointmentNoun} is scheduled`;
  if (appointmentStatus === 'processing') {
    headerMessage = "We're analyzing your sample";
  } else if (daysUntil === 0) {
    headerMessage = `${appointmentNoun} is today`;
  } else if (daysUntil === 1) {
    headerMessage = `${appointmentNoun} is tomorrow`;
  } else if (daysUntil !== null && daysUntil > 1) {
    headerMessage = `${appointmentNoun} is in ${daysUntil} days`;
  }

  const primaryMessage =
    appointmentStatus === 'processing'
      ? 'We received your sample'
      : 'Your blood draw is scheduled.';

  const secondaryMessage =
    appointmentStatus === 'processing'
      ? 'Your results and health protocol will be ready within 10 days'
      : 'Your results will be uploaded to your dashboard once complete.';

  const locationText =
    activeLabOrder.collectionMethod === 'AT_HOME'
      ? 'At home'
      : activeLabOrder?.address?.line?.[0] || 'In lab';

  const shouldShowDirections =
    appointmentStatus === 'scheduled' &&
    activeLabOrder.collectionMethod !== 'AT_HOME' &&
    hasValidLocation;

  const calendarData =
    appointmentStatus === 'scheduled' && slot && hasValidLocation
      ? {
          slot,
          address: activeLabOrder.address,
          collectionMethod: activeLabOrder.collectionMethod || 'IN_LAB',
          serviceNames: serviceNames,
        }
      : null;

  let formattedDateTime: string | null = null;
  if (activeLabOrder.startTimestamp) {
    const date = new Date(activeLabOrder.startTimestamp);
    if (!Number.isNaN(date.getTime())) {
      const timeZone = activeLabOrder.timezone ?? 'America/Los_Angeles';
      const baseFormat: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };

      try {
        formattedDateTime = new Intl.DateTimeFormat('en-US', {
          ...baseFormat,
          timeZone,
        }).format(date);
      } catch {
        formattedDateTime = new Intl.DateTimeFormat('en-US', baseFormat).format(
          date,
        );
      }
    }
  }

  return (
    <HomepageCard>
      {hasMultiple && (
        <nav
          aria-label="Appointment navigation"
          className="mb-4 grid grid-cols-3 items-center"
        >
          <div className="justify-self-start">
            {safeIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentIndex(safeIndex - 1)}
                className="inline-flex min-h-11 items-center gap-1 rounded text-sm font-medium text-zinc-500 outline-none transition-colors hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Previous
              </button>
            )}
          </div>
          <div className="justify-self-center text-xs text-zinc-400">
            {safeIndex + 1} of {totalAppointments}
          </div>
          <div className="justify-self-end">
            {safeIndex < totalAppointments - 1 && (
              <button
                type="button"
                onClick={() => setCurrentIndex(safeIndex + 1)}
                className="inline-flex min-h-11 items-center gap-1 rounded text-sm font-medium text-zinc-500 outline-none transition-colors hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-ring"
              >
                Next
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </nav>
      )}

      {hasMultiple && (
        <div role="status" aria-live="polite" className="sr-only">
          Showing appointment {safeIndex + 1} of {totalAppointments}.{' '}
          {headerMessage}.
        </div>
      )}

      <div key={activeLabOrder.id} className="duration-300 animate-in fade-in">
        {/* Header */}
        <div className="mb-6 text-center">
          <H3 className="text-2xl font-normal">{headerMessage}</H3>
          <Body2 className="mt-2 text-zinc-500">{serviceNames}</Body2>
        </div>

        {/* Image */}
        <div className="relative mb-6 flex justify-center">
          <div className="relative h-56 overflow-hidden">
            <picture>
              <source
                type="image/webp"
                srcSet="/services/custom_blood_panel-404.webp 1x, /services/custom_blood_panel-808.webp 2x"
              />
              <img
                src="/services/custom_blood_panel.png"
                alt="Superpower service"
                className="h-72 w-auto object-contain object-top"
                width={404}
                height={288}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </picture>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-transparent to-zinc-50 md:to-white" />
          </div>
        </div>

        {/* Section */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <Body1 className="font-medium text-zinc-900">
              {primaryMessage}
            </Body1>
            <Link
              to="/orders/$id"
              params={{ id: activeLabOrder.id }}
              className="group text-sm text-zinc-500 hover:text-zinc-700"
            >
              <span className="hidden md:inline-block">More details </span>
              <ArrowUpRightIcon className="-mt-1 ml-0.5 inline-block size-4 transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <Body2 className="mb-6 text-zinc-600">{secondaryMessage}</Body2>

          <LabOrderProgress status={appointmentStatus} />
        </div>

        {/* Desktop: Date & Location with CTAs - Only show when scheduled */}
        {appointmentStatus === 'scheduled' && activeLabOrder.startTimestamp && (
          <div className="mb-4 mt-6 hidden items-center justify-between pl-4 md:flex">
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 size-5 text-zinc-500" />
              <div>
                <Body2 className="font-medium text-zinc-900">Date</Body2>
                <Body2 className="text-zinc-600">{formattedDateTime}</Body2>
              </div>
            </div>
            {calendarData && calendarData.address && (
              <AddToCalendar
                slot={calendarData.slot}
                address={calendarData.address}
                collectionMethod={calendarData.collectionMethod}
                variant="button"
                className="shrink-0"
              />
            )}
          </div>
        )}

        {appointmentStatus === 'scheduled' && (
          <div className="my-6 hidden items-center justify-between pl-4 md:flex">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 text-zinc-500" />
              <div>
                <Body2 className="font-medium text-zinc-900">Location</Body2>
                <Body2 className="text-zinc-600">{locationText}</Body2>
              </div>
            </div>
            {shouldShowDirections && (
              <Button
                variant="outline"
                size="medium"
                className="shrink-0"
                onClick={() => handleOpenInMaps(activeLabOrder.address)}
              >
                Get directions
              </Button>
            )}
          </div>
        )}

        {/* Mobile: Action buttons - Only show when scheduled */}
        {appointmentStatus === 'scheduled' && (
          <div className="mb-6 mt-4 flex gap-3 md:hidden">
            {calendarData && calendarData.address && (
              <AddToCalendar
                slot={calendarData.slot}
                address={calendarData.address}
                collectionMethod={calendarData.collectionMethod}
                variant="button"
                className="flex-1"
              />
            )}
            {shouldShowDirections && (
              <Button
                size="medium"
                className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800"
                onClick={() => handleOpenInMaps(activeLabOrder.address)}
              >
                Get directions
              </Button>
            )}
          </div>
        )}

        {/* Before Your Appointment */}
        {appointmentStatus === 'scheduled' && (
          <div>
            <H3 className="mb-2 text-center text-xl font-normal md:mb-4 md:text-left">
              Before your appointment
            </H3>
            {formattedDateTime && (
              <Body2 className="mb-6 text-center text-zinc-600 md:hidden">
                {formattedDateTime}
              </Body2>
            )}
            <PreparationTipsCarousel />
          </div>
        )}
      </div>
    </HomepageCard>
  );
};
