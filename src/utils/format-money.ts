import { REQUESTABLE_SERVICES } from '@/const';
import { HealthcareService } from '@/types/api';

export const formatMoney = (
  amount: number,
  decimalPlaces: number = 0,
): string => {
  return (
    '$' +
    (amount / 100)
      .toFixed(decimalPlaces)
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  );
};

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
