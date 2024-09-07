import { MapPin } from 'lucide-react';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useStepper } from '@/components/ui/stepper';
import { Body1, Body2, H2, H3, H4 } from '@/components/ui/typography';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { usePhlebotomyLocations } from '@/features/orders/api';
import { useDebounce } from '@/hooks/use-debounce';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { PhlebotomyLocation } from '@/types/api';
import { formatAddress } from '@/utils/format';

const InLabServiceCard = () => {
  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 p-6">
      <H3 className="text-zinc-700">In person lab</H3>
      <div className="space-y-2">
        <Body1 className="text-zinc-500">
          Perform testing at a partner clinic.
        </Body1>
      </div>
    </div>
  );
};

export const InLab = () => {
  const { prevStep } = useStepper((s) => s);
  const { data: user } = useUser();
  const [zipCode, setZipCode] = useState(
    user?.primaryAddress?.address?.postalCode ?? '',
  );
  const debouncedZipCode = useDebounce(zipCode, 500);

  const phlebotomyLocationsMutation = usePhlebotomyLocations({
    postalCode: debouncedZipCode,
    queryConfig: { enabled: debouncedZipCode.length === 5 },
  });

  return (
    <section id="main" className="space-y-16">
      <div className="space-y-4">
        <H2 className="text-zinc-900">Service type</H2>
        <InLabServiceCard />
      </div>

      <div className="space-y-12">
        <div className="space-y-3">
          <H2 className="text-zinc-900">We will find a lab for you</H2>
          <H4 className="text-zinc-500">
            Please provide us your zip code, a concierge will be contacting you
            when a nearby testing lab is found.
          </H4>
        </div>
        <div className="space-y-2">
          <div className="flex flex-row items-center">
            <Body2 className="text-zinc-500">My zip code</Body2>
            {phlebotomyLocationsMutation.isLoading && (
              <span>
                <Spinner variant="primary" />
              </span>
            )}
          </div>
          <Input
            maxLength={5}
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
          <LocationList
            locations={phlebotomyLocationsMutation.data?.locations || []}
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
        </div>
      </div>
    </section>
  );
};

function LocationList({
  locations,
}: {
  locations: PhlebotomyLocation[];
}): JSX.Element {
  const { updateServiceAddress, serviceAddress } = useOnboarding();
  const { nextOnboardingStep } = useStepper((s) => s);

  if (!locations || locations.length === 0) {
    return (
      <p className="text-zinc-500">
        No locations found. Please enter a new zip code.
      </p>
    );
  }

  return (
    <div className="max-h-[240px] overflow-y-scroll rounded-2xl border border-zinc-200 p-2">
      <div className="flex flex-col">
        {locations?.map((option, index) => (
          <button
            key={index}
            className={cn(
              'rounded-lg p-4 text-left transition-all hover:bg-accent',
              // selected && formatAddress(selected?.address) === formatAddress(item.address) && 'bg-muted'
            )}
            onClick={async () => {
              updateServiceAddress({ address: option.address, id: nanoid() });
              await nextOnboardingStep();
            }}
          >
            <div className="flex items-center gap-4">
              <RadioIcon
                checked={
                  !!serviceAddress &&
                  formatAddress(serviceAddress?.address) ===
                    formatAddress(option.address)
                }
              />
              <div className="flex flex-col items-start">
                <h3 className="text-[#52525B]">
                  {formatAddress(option.address)}
                </h3>
                <div className="flex flex-row items-center text-[#A1A1AA]">
                  <MapPin className="mr-1 size-4" />
                  <p className="text-sm">
                    {option.name
                      ? `${option.name} ( ${option.distance} mile${option.distance > 1 ? 's' : ''} )`
                      : `${option.distance} mile${option.distance > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export interface RadioIconProps {
  checked?: boolean;
}

export function RadioIcon({ checked = false }: RadioIconProps): JSX.Element {
  return checked ? <RadioChecked /> : <RadioEmpty />;
}

function RadioEmpty(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke="#E4E4E7" />
    </svg>
  );
}

function RadioChecked(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="11"
        stroke="#18181B"
        strokeWidth="2"
      />
      <rect x="4" y="4" width="16" height="16" rx="8" fill="#18181B" />
    </svg>
  );
}
