import { ArrowUpRightIcon, Calendar, MapPin } from 'lucide-react';
import moment from 'moment-timezone';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { AddToCalendar } from '@/components/shared/add-to-calendar-button';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2, H3 } from '@/components/ui/typography';
import {
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const/services';
import { useActiveBloodPanelOrders } from '@/features/orders/hooks';
import { Location } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { PhlebotomyProgress } from './phlebotomy-progress';
import { PreparationTipsCarousel } from './preparation-tips';

const getServiceDisplayName = (serviceName: string): string => {
  switch (serviceName) {
    case SUPERPOWER_BLOOD_PANEL:
      return 'Superpower baseline test';
    case ADVANCED_BLOOD_PANEL:
      return 'Advanced blood panel';
    case CUSTOM_BLOOD_PANEL:
      return 'Custom blood panel';
    default:
      return serviceName;
  }
};

const getDaysUntilAppointment = (timestamp?: string): number | null => {
  if (!timestamp) return null;
  const now = moment();
  const appointmentDate = moment(timestamp);

  if (now.isSame(appointmentDate, 'day')) {
    return 0;
  }

  const diff = appointmentDate.diff(now, 'days', true);
  return diff > 0 ? Math.ceil(diff) : Math.floor(diff);
};

/**
 * Validates if a location has sufficient information for map navigation
 */
const isValidLocation = (location?: Location | null): boolean => {
  if (!location?.address) return false;

  const { line, city, state: _state, postalCode } = location.address;
  const hasAddressLine = line && line.length > 0 && line[0];
  const hasCityOrPostal = city || postalCode;

  return Boolean(hasAddressLine && hasCityOrPostal);
};

export const PhlebotomyAppointmentCard = () => {
  const { activeBloodPanelOrder, isLoading } = useActiveBloodPanelOrders();

  /**
   * Callback to open location in maps
   * Builds a basic address string and opens it in Google Maps
   */
  const handleOpenInMaps = useCallback((location: Location) => {
    const address = location.address;

    if (!address) return;

    // Build address string from components
    const addressParts = [
      ...(address.line || []),
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);

    const addressString = addressParts.join(', ');
    const query = location.name
      ? `${location.name} ${addressString}`
      : addressString;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <Skeleton className="mb-2 h-7 w-48" />
        <Skeleton className="mb-6 h-6 w-64" />
        <Skeleton className="mx-auto h-64 w-48" />
      </section>
    );
  }

  if (!activeBloodPanelOrder) {
    return null;
  }

  const displayName = getServiceDisplayName(activeBloodPanelOrder.serviceName);
  const imageUrl = getServiceImage(activeBloodPanelOrder.serviceName);
  const daysUntil = getDaysUntilAppointment(
    activeBloodPanelOrder.startTimestamp,
  );

  const appointmentStatus = (() => {
    if (
      activeBloodPanelOrder.startTimestamp &&
      moment(activeBloodPanelOrder.startTimestamp)
        .add(1, 'hour')
        .isBefore(moment())
    ) {
      return 'processing';
    }
    return 'scheduled';
  })();

  const hasValidLocation = isValidLocation(activeBloodPanelOrder.location);
  const slot =
    activeBloodPanelOrder.startTimestamp && activeBloodPanelOrder.endTimestamp
      ? {
          start: activeBloodPanelOrder.startTimestamp,
          end: activeBloodPanelOrder.endTimestamp,
        }
      : null;

  const headerMessage = (() => {
    if (appointmentStatus === 'processing') {
      return "We're analyzing your sample";
    }
    if (daysUntil === 0) {
      return 'Your appointment is today';
    }
    if (daysUntil === 1) {
      return 'Your appointment is tomorrow';
    }
    if (daysUntil !== null && daysUntil > 1) {
      return `Your appointment is in ${daysUntil} days`;
    }
    return 'Your appointment is scheduled';
  })();

  const primaryMessage =
    appointmentStatus === 'processing'
      ? 'We received your sample'
      : 'Your blood draw is scheduled.';

  const secondaryMessage =
    appointmentStatus === 'processing'
      ? 'Your results and health protocol will be ready in 5-7 days'
      : 'Your results will be uploaded to your dashboard once complete.';

  const locationText =
    activeBloodPanelOrder.collectionMethod === 'AT_HOME'
      ? 'At home'
      : activeBloodPanelOrder.location?.name ||
        activeBloodPanelOrder.location?.address?.line?.[0] ||
        'In lab';

  const shouldShowDirections =
    appointmentStatus === 'scheduled' &&
    activeBloodPanelOrder.collectionMethod !== 'AT_HOME' &&
    hasValidLocation;

  const calendarData =
    appointmentStatus === 'scheduled' && slot && hasValidLocation
      ? {
          slot,
          address: activeBloodPanelOrder.location.address,
          collectionMethod: activeBloodPanelOrder.collectionMethod || 'IN_LAB',
          serviceName: activeBloodPanelOrder.serviceName,
        }
      : null;

  const formattedDateTime = activeBloodPanelOrder.startTimestamp
    ? moment(activeBloodPanelOrder.startTimestamp)
        .tz(activeBloodPanelOrder.timezone || 'America/Los_Angeles')
        .format('MMM Do, YYYY, h:mm A')
    : null;

  return (
    <div className="md:rounded-3xl md:bg-white md:p-6 md:shadow-sm">
      {/* Header */}
      <div className="mb-6 text-center">
        <Body2 className="mb-2 text-zinc-500">{displayName}</Body2>
        <H3 className="text-2xl font-normal">{headerMessage}</H3>
      </div>

      {/* Image */}
      <div className="relative mb-6 flex justify-center">
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageUrl}
            alt={displayName}
            className="h-72 w-auto object-contain object-top"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-transparent to-zinc-50 md:to-white" />
        </div>
      </div>

      {/* Section */}
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Body1 className="font-medium text-zinc-900">{primaryMessage}</Body1>
          <Link
            to={`/orders/${activeBloodPanelOrder.id}`}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            <span className="hidden md:inline-block">More details </span>
            <ArrowUpRightIcon className="-mt-1 ml-0.5 inline-block size-4" />
          </Link>
        </div>

        <Body2 className="mb-6 text-zinc-600">{secondaryMessage}</Body2>

        <PhlebotomyProgress status={appointmentStatus} />
      </div>

      {/* Desktop: Date & Location with CTAs - Only show when scheduled */}
      {appointmentStatus === 'scheduled' &&
        activeBloodPanelOrder.startTimestamp && (
          <div className="mb-4 hidden items-center justify-between md:flex">
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
                serviceName={calendarData.serviceName}
                variant="button"
                className="shrink-0"
              />
            )}
          </div>
        )}

      {appointmentStatus === 'scheduled' && (
        <div className="mb-6 hidden items-center justify-between md:flex">
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
              onClick={() =>
                handleOpenInMaps(activeBloodPanelOrder.location as Location)
              }
            >
              Get directions
            </Button>
          )}
        </div>
      )}

      {/* Mobile: Action buttons - Only show when scheduled */}
      {appointmentStatus === 'scheduled' && (
        <div className="mb-6 flex gap-3 md:hidden">
          {calendarData && calendarData.address && (
            <AddToCalendar
              slot={calendarData.slot}
              address={calendarData.address}
              collectionMethod={calendarData.collectionMethod}
              serviceName={calendarData.serviceName}
              variant="button"
              className="flex-1"
            />
          )}
          {shouldShowDirections && (
            <Button
              size="medium"
              className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={() =>
                handleOpenInMaps(activeBloodPanelOrder.location as Location)
              }
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
  );
};
