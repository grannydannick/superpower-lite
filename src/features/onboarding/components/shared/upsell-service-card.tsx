import { InfoIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Body2 } from '@/components/ui/typography';
import {
  ENVIRONMENTAL_TOXIN_TEST_ID,
  HEAVY_METALS_TEST_ID,
  MYCOTOXINS_TEST_ID,
  TOTAL_TOXIN_TEST_ID,
} from '@/const/services';
import { ServiceWithMetadata } from '@/features/onboarding/hooks/use-test-kits';
import { HealthcareServiceDialog } from '@/features/orders/components/healthcare-service-dialog';
import { ServiceSelectCard } from '@/features/services/components/service-select-card';

const INDIVIDUAL_TOXIN_TEST_IDS = [
  MYCOTOXINS_TEST_ID,
  HEAVY_METALS_TEST_ID,
  ENVIRONMENTAL_TOXIN_TEST_ID,
];

export const UpsellServiceCard = ({
  service,
  services,
  selectedServices,
  toggleService,
}: {
  service: ServiceWithMetadata;
  services: ServiceWithMetadata[];
  selectedServices: ServiceWithMetadata[];
  toggleService: (item: ServiceWithMetadata) => void;
}) => {
  const isSelected = selectedServices.some(
    (selectedService) => selectedService.id === service.id,
  );

  // Determine if this card should be disabled
  const isDisabled = useMemo(() => {
    // If the service was already ordered, disable it
    if (service.order) {
      return true;
    }

    // If this is an individual toxin test, it's disabled when Total Toxins is selected or ordered
    if (INDIVIDUAL_TOXIN_TEST_IDS.includes(service.id)) {
      return (
        selectedServices.some((s) => s.id === TOTAL_TOXIN_TEST_ID) ||
        services.some((s) => s.id === TOTAL_TOXIN_TEST_ID && s.order)
      );
    }

    return false;
  }, [service.id, service.order, selectedServices, services]);

  const handleSelectService = () => {
    if (!isDisabled) {
      toggleService(service);
    }
  };

  return (
    <ServiceSelectCard
      checked={isSelected}
      disabled={isDisabled}
      toggle={handleSelectService}
      service={service}
      details={() => ({
        trigger: (
          <HealthcareServiceDialog
            healthcareService={service}
            flow="info"
            infoFlowBtn={() => (
              <DialogClose asChild>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!isDisabled) handleSelectService();
                  }}
                >
                  Add
                </Button>
              </DialogClose>
            )}
          >
            <div className="flex cursor-pointer items-center gap-1.5 group">
              <Body2 className="line-clamp-2 text-secondary group-hover:text-zinc-700 transition-all duration-200">
                Learn more
              </Body2>
              <InfoIcon className="size-4 text-zinc-400 group-hover:text-zinc-500 transition-all duration-200" />
            </div>
          </HealthcareServiceDialog>
        ),
      })}
    />
  );
};
