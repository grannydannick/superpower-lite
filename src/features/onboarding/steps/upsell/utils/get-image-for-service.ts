import { HealthcareService } from '@/types/api';

import { UPSELL_SERVICES } from '../const/upsell-services';

export const getImageForService = (service: HealthcareService) => {
  const upsellService = UPSELL_SERVICES.find(
    (upsell) => upsell.item.name === service.name,
  );

  return upsellService?.item.image;
};
