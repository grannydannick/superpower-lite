import { CUSTOM_BLOOD_PANEL_ID } from '@/const';
import { BookingStepID } from '@/features/orders/utils/get-steps-for-service';

export const getServiceActionUrl = (serviceId: string): string => {
  const params = new URLSearchParams({
    initialAddOnIds: `${serviceId}`,
    excludeSteps: `${BookingStepID.INFO}, ${BookingStepID.RECOMMENDATIONS}`,
  });

  return `/services/${CUSTOM_BLOOD_PANEL_ID}?${params.toString()}`;
};
