import React from 'react';

import { HealthcareServiceInfoDialogContent } from '@/components/shared/healthcare-service-info-dialog-content';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useOnboarding } from '@/features/onboarding/stores/onboarding-store';
import { HealthcareService } from '@/types/api';

export const HealthcareCardDialog = ({
  healthcareService,
}: {
  healthcareService: HealthcareService;
}) => {
  const { updateAdditionalService } = useOnboarding();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <a
          href="#"
          className="text-sm leading-5 text-[#FC5F2B]"
          onClick={(e) => e.stopPropagation()}
        >
          More info
        </a>
      </DialogTrigger>

      <HealthcareServiceInfoDialogContent healthcareService={healthcareService}>
        <DialogClose>
          <Button onClick={() => updateAdditionalService(healthcareService)}>
            Add to cart
          </Button>
        </DialogClose>
      </HealthcareServiceInfoDialogContent>
    </Dialog>
  );
};
