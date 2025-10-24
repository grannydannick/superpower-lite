import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Body1 } from '@/components/ui/typography';
import { RescheduleDialogMode } from '@/features/orders/types/reschedule-dialog-mode';
import { BookingStepID } from '@/features/orders/utils/get-steps-for-service';
import { HealthcareService, Order } from '@/types/api';

import { HealthcareServiceDialog } from '../healthcare-service-dialog';

import { HealthcareServiceRescheduleConfirmation } from './healthcare-service-reschedule-confirmation';
import { HealthcareServiceRescheduleDetails } from './healthcare-service-reschedule-details';
import { HealthcareServiceRescheduleFooter } from './healthcare-service-reschedule-footer';

export const HealthcareServiceReschedule = ({
  order,
  healthcareService,
}: {
  order: Order;
  healthcareService?: HealthcareService;
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<RescheduleDialogMode>('default');
  const [skipStepIds, setSkipStepIds] = useState<BookingStepID[]>([]);

  const content = useMemo(() => {
    switch (mode) {
      case 'default':
        return (
          <HealthcareServiceRescheduleDetails
            order={order}
            healthcareService={healthcareService}
          />
        );
      case 'cancel':
      case 'reschedule':
        return (
          <HealthcareServiceRescheduleConfirmation order={order} mode={mode} />
        );
      case 'booking': {
        // this should never hit
        // but just in case => let user know
        if (!healthcareService)
          return (
            <Body1>Unknown error happened, please report to concierge.</Body1>
          );

        return (
          <HealthcareServiceDialog
            healthcareService={healthcareService}
            excludeSteps={skipStepIds}
            onClose={() => navigate('/marketplace?tab=orders')}
          />
        );
      }
      default:
        return null;
    }
  }, [mode, order, healthcareService, skipStepIds]);

  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      {content}
      <HealthcareServiceRescheduleFooter
        healthcareService={healthcareService}
        order={order}
        mode={mode}
        setMode={setMode}
        setSkipStepIds={setSkipStepIds}
      />
    </div>
  );
};
