import { HealthcareService } from '@/types/api';

import { UPSELL_SERVICES } from '../const/upsell-services';

export const getUpsellServices = (services: HealthcareService[]) => {
  return services
    .filter((service) => service.active)
    .map((service) => {
      const upsellConfig = UPSELL_SERVICES.find(
        (us) => us.item.name === service.name,
      );

      if (!upsellConfig) return null;

      return {
        order: upsellConfig.order,
        item: {
          ...service,
          price: service.price,
          image: upsellConfig.item.image,
          tag: upsellConfig.item.tag,
          faqs: upsellConfig.item.faqs,
        },
        cover: upsellConfig.cover,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
};
