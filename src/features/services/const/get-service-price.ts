import { REQUESTABLE_SERVICES } from '@/const';
import { HealthcareService } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

export const getHealthcareServicePriceLabel = (
  healthcareService: HealthcareService,
) => {
  const hasItems = healthcareService.items.length > 0;
  const isFreeService = healthcareService.price === 0;
  const isRequestable = REQUESTABLE_SERVICES.includes(healthcareService.name);

  if (hasItems) {
    return 'Price determined at checkout';
  }

  if (isFreeService) {
    return isRequestable ? 'Price on request' : 'Included in subscription';
  }

  return formatMoney(healthcareService.price);
};
