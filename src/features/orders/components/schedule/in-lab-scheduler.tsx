import { useState } from 'react';

import { LocationsScheduler } from '@/components/shared/scheduler';
import { Input } from '@/components/ui/input';
import { Body2 } from '@/components/ui/typography';
import { useUser } from '@/lib/auth';
import { PhlebotomyLocation, Slot } from '@/types/api';

import { useScheduleStore } from '../../stores/schedule-store';

export const InLabScheduler = () => {
  const { data: user } = useUser();

  const { slot, location, updateSlot, updateLocation, updateTz } =
    useScheduleStore((s) => s);

  const [zipCode, setZipCode] = useState<string>(
    location?.address.postalCode ?? user?.primaryAddress?.postalCode ?? '',
  );

  const handleSelectionChange = (
    location: PhlebotomyLocation | null,
    slot: Slot | null,
    tz: string,
  ) => {
    updateLocation(location);
    updateSlot(slot);
    updateTz(tz);
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setZipCode(value);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Body2 className="text-secondary">
            Zip code <span className="text-vermillion-900">*</span>
          </Body2>
        </div>
        <div>
          <Input
            value={zipCode}
            onChange={handleZipCodeChange}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            placeholder="5-digit ZIP code"
          />
        </div>
      </div>
      <div className="space-y-4">
        <LocationsScheduler
          postalCode={zipCode}
          onSelectionChange={handleSelectionChange}
          selectedSlot={slot}
          selectedLocation={location}
        />
      </div>
    </div>
  );
};
