import { CornerUpRight, ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { Body1 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { formatDistanceText } from '@/features/orders/utils/format-distance-text';
import { getNormalizedText } from '@/features/orders/utils/get-normallized-text';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation } from '@/types/api';
import { isIOS } from '@/utils/browser-detection';
import { formatAddress, toTitleCase } from '@/utils/format';

import { openInMaps } from '../utils/open-in-maps';

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

const LocationListOptions = ({
  locations,
}: {
  locations: PhlebotomyLocation[];
}) => {
  const { location } = useOrder((s) => s);

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

const LocationListOption = ({
  option,
  index,
  isSelected,
}: {
  option: PhlebotomyLocation;
  index: number;
  isSelected: boolean;
}) => {
  const updateLocation = useOrder((s) => s.updateLocation);
  const streetAddress = option.address.line
    .map((line) => getNormalizedText(line))
    .join(', ');
  const city = getNormalizedText(option.address.city);
  const distanceText = formatDistanceText(option.distance);

  const locationName = `${toTitleCase(option.name)}, ${streetAddress}`;
  const locationDetails = `${city}, ${option.address.state}, ${option.address.postalCode} · ${distanceText}`;

  const handleOpenMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mapType = isIOS() ? 'apple' : 'google';
    openInMaps(option, mapType);
  };

  return (
    <div
      className={cn(
        'flex space-x-4 border rounded-2xl px-4 py-5 flex-1 bg-white',
        isSelected
          ? 'border-vermillion-900 shadow-lg shadow-vermillion-900/10'
          : 'border-zinc-200 hover:bg-zinc-50',
      )}
      onClick={() =>
        isSelected ? updateLocation(null) : updateLocation(option)
      }
      role="presentation"
    >
      <RadioGroupItem
        value={formatAddress(option.address)}
        id={`item-${index}`}
        checked={isSelected}
        variant="vermillion"
      />
      <div className="flex grow flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <Body1>{locationName}</Body1>
          {!option?.capabilities.includes('APPOINTMENT_SCHEDULING') ? (
            <Badge variant="vermillion" className="hidden sm:inline-flex">
              WALK IN
            </Badge>
          ) : null}
        </div>
        {!option?.capabilities.includes('APPOINTMENT_SCHEDULING') ? (
          <Badge variant="vermillion" className="inline-flex sm:hidden">
            WALK IN
          </Badge>
        ) : null}
        <Body1 className="text-secondary">{locationDetails}</Body1>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="hidden aspect-square items-center gap-2 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 sm:flex"
              onClick={handleOpenMaps}
            >
              <CornerUpRight className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>See location on Google Maps</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="icon"
        className="size-10 rounded-full hover:bg-zinc-200/50 sm:hidden"
        onClick={handleOpenMaps}
      >
        <ExternalLink className="size-5 text-zinc-400" />
      </Button>
    </div>
  );
};

const LocationListSkeleton = () => {
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
