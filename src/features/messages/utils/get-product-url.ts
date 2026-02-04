import { env } from '@/config/env';
import type { HealthcareService, Product, Rx } from '@/types/api';

import { isHealthcareService, isProduct } from './product-utils';

/**
 * Returns the appropriate URL for a marketplace product.
 *
 * - Products (supplements): Marketing site URL or product.url
 * - Rx (prescriptions): /prescriptions/{id}
 * - Services: /services/{id}
 */
export function getProductUrl(
  product: Product | Rx | HealthcareService,
): string {
  if (isHealthcareService(product)) {
    return `/services/${product.id}`;
  }

  if (isProduct(product)) {
    if (product.url) {
      return product.url.startsWith('/marketplace')
        ? `${env.MARKETING_SITE_URL}${product.url}`
        : product.url;
    }
    return '#';
  }

  // Rx (prescription)
  return `/prescriptions/${product.id}`;
}
