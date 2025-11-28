import { getPrescriptionImage } from '@/utils/prescription';
import { getServiceImage } from '@/utils/service';

import type { Activity } from '../api';

export const getItemDetails = (activity: Activity) => {
  switch (activity.type) {
    case 'product':
      return {
        title: activity.product.name,
        image: activity.product.image,
        price: activity.product.price * 100,
        url: activity.product.url,
        linkType: 'external' as const,
      };
    case 'service':
      return {
        title: activity.service.name,
        image: getServiceImage(activity.service.name),
        price: activity.service.price,
        url: `/services/${activity.service.id}`,
        linkType: 'internal' as const,
      };
    case 'prescription':
      return {
        title: activity.prescription.name,
        image: getPrescriptionImage(activity.prescription.name),
        price: Number(activity.prescription.price) * 100,
        url: activity.prescription.url,
        linkType: 'internal' as const,
      };
    case 'general':
    case 'avoid-product':
    case 'lifestyle':
    case 'nutrition':
      return {
        title: activity.title,
        price: 0,
        url: undefined,
        linkType: undefined,
      };
    default:
      return {
        title: 'Recommendation',
        price: 0,
        url: undefined,
        linkType: undefined,
      };
  }
};
