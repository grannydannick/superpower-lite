import { MapPin } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Body1, Body3 } from '@/components/ui/typography';
import { useOrder } from '@/features/orders/stores/order-store';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation } from '@/types/api';
import { formatAddress } from '@/utils/format';

export const LocationList = ({
  locations,
}: {
  locations: PhlebotomyLocation[];
}) => {
  const { location, updateLocation } = useOrder((s) => s);

  if (!locations || locations.length === 0) {
    return (
      <p className="text-zinc-500">
        No locations found. Please enter a new zip code.
      </p>
    );
  }

  return (
    <div className="max-h-[240px] overflow-y-scroll rounded-2xl border border-zinc-200 bg-white p-2">
      <RadioGroup
        className="flex flex-col"
        defaultValue={formatAddress(location?.address)}
      >
        {locations?.map((option, index) => (
          <Label
            key={index}
            className={cn(
              'rounded-lg py-4 px-6 text-left transition-all hover:bg-accent flex cursor-pointer items-center gap-4',
              formatAddress(location?.address) === formatAddress(option.address)
                ? 'bg-accent'
                : null,
            )}
            onClick={() => {
              updateLocation(option);
            }}
            htmlFor={`item-${index}`}
          >
            <RadioGroupItem
              value={formatAddress(option.address)}
              id={`item-${index}`}
            />
            <div className="flex flex-col items-start gap-1">
              <Body1 className="text-zinc-600">
                {formatAddress(option.address)}
              </Body1>
              <div className="flex flex-row items-center gap-px">
                <MapPin className="h-4 min-w-4 text-zinc-400" />
                <Body3 className="text-zinc-400">
                  {option.name
                    ? `${option.name} ( ${option.distance} mile${option.distance > 1 ? 's' : ''} )`
                    : `${option.distance} mile${option.distance > 1 ? 's' : ''}`}
                </Body3>
              </div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};
