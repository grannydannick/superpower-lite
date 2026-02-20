import { CornerUpRight } from 'lucide-react';
import moment from 'moment-timezone';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipPortal,
} from '@/components/ui/tooltip';
import { Body1, Body2, Body3 } from '@/components/ui/typography';
import { getNormalizedText } from '@/features/orders/utils/get-normallized-text';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation, Slot } from '@/types/api';
import { isIOS } from '@/utils/browser-detection';
import { formatAddress, toTitleCase } from '@/utils/format';
import { formatDistanceText } from '@/utils/format-distance';

import { useScheduleStore } from '../../stores/schedule-store';
import { openInMaps } from '../../utils/open-in-maps';

export const LocationList = ({
  locations,
  isLoading,
}: {
  locations?: PhlebotomyLocation[];
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1">
        <div className="min-h-24 overflow-y-auto">
          <LocationListSkeleton />
        </div>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1">
        <div className="flex min-h-24 items-center justify-center">
          <Body1 className="text-zinc-500">
            Available locations will appear here
          </Body1>
        </div>
      </div>
    );
  }

  return <LocationListOptions locations={locations} />;
};

export const LocationListOptions = ({
  locations,
}: {
  locations: PhlebotomyLocation[];
}) => {
  const location = useScheduleStore((s) => s.location);

  return (
    <RadioGroup
      className="flex max-h-80 flex-col gap-2 overflow-y-auto p-1 scrollbar scrollbar-thumb-zinc-300 [overflow:overlay] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:w-2"
      defaultValue={formatAddress(location?.address)}
    >
      {locations.map((option, index) => (
        <LocationListOption
          key={index}
          option={option}
          index={index}
          isSelected={
            formatAddress(location?.address) === formatAddress(option.address)
          }
        />
      ))}
    </RadioGroup>
  );
};

export const LocationListOption = ({
  option,
  index,
  isSelected,
  isRadioButton = true,
  slots = [],
  timezone,
}: {
  option: PhlebotomyLocation;
  index: number;
  isSelected: boolean;
  isRadioButton?: boolean;
  slots?: Slot[];
  timezone?: string;
}) => {
  const updateLocation = useScheduleStore((s) => s.updateLocation);

  const streetAddress = option.address.line
    .map((line) => getNormalizedText(line))
    .join(', ');
  const city = getNormalizedText(option.address.city);
  const distanceText = formatDistanceText(option.distance);

  const locationName = `${toTitleCase(option.name)}`;
  const locationDetails = `${streetAddress}, ${city}`;

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mapType = isIOS() ? 'apple' : 'google';
    openInMaps(option, mapType);
  };

  return (
    <div
      className={cn(
        'flex gap-4 rounded-[20px] border border-zinc-200 bg-white p-3',
        isRadioButton ? 'flex-row' : 'flex-col',
        isSelected
          ? 'border-vermillion-900 shadow-lg shadow-vermillion-900/10'
          : 'border-zinc-200 hover:bg-zinc-50',
      )}
      onClick={() => {
        if (!isRadioButton) return;

        if (isSelected) {
          updateLocation(null);
        } else {
          updateLocation(option);
        }
      }}
      role="presentation"
    >
      {isRadioButton ? (
        <RadioGroupItem
          value={formatAddress(option.address)}
          id={`item-${index}`}
          checked={isSelected}
          variant="vermillion"
        />
      ) : null}
      <div className="flex w-full flex-col items-start gap-1">
        <div className="flex w-full items-start justify-between gap-1.5">
          <Body1>{locationName}</Body1>
          <div className="flex items-center gap-1">
            <Body2 className="text-nowrap text-secondary">{distanceText}</Body2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="aspect-square items-center gap-2 rounded-md p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                    onClick={handleOpenMaps}
                  >
                    <CornerUpRight className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>See location on Google Maps</TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <Body2 className="text-secondary">{locationDetails}</Body2>
        {!option?.capabilities.includes('APPOINTMENT_SCHEDULING') ? (
          <Body3 className="text-secondary">
            Walk-in only during business hours. Wait time ~15-30min.
          </Body3>
        ) : null}
      </div>
      {slots.length > 0 && timezone ? (
        <LocationSlots slots={slots} timezone={timezone} />
      ) : null}
    </div>
  );
};

const LocationSlots = ({
  slots,
  timezone,
}: {
  slots: Slot[];
  timezone?: string;
}) => {
  const { slot, updateSlot } = useScheduleStore((s) => s);
  return (
    <div className="flex gap-2 overflow-x-auto">
      {slots.map((s) => {
        const isSelected = slot?.start === s.start;

        const timeRangeText = timezone
          ? `${moment(s.start).tz(timezone).format('h:mma')} - ${moment(s.end).tz(timezone).format('h:mma')}`
          : undefined;

        if (!timeRangeText) return;

        return (
          <button
            key={s.start}
            type="button"
            onClick={() => updateSlot(s)}
            className={cn(
              'space-y-1 rounded-xl border bg-white p-3 text-left transition',
              'hover:bg-zinc-50',
              isSelected ? 'border-vermillion-900' : null,
            )}
          >
            <Body2 className="text-nowrap">{timeRangeText}</Body2>
          </button>
        );
      })}
    </div>
  );
};

export const LocationListSkeleton = () => {
  return (
    <div className="flex h-full flex-col gap-2 p-2">
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="flex items-center rounded-lg p-4">
            <div className="flex w-full items-center gap-4">
              <Skeleton className="size-5 shrink-0 rounded-full" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
