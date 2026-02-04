import type { HealthcareService, Product, Rx } from '@/types/api';

export const FALLBACK_SUPPLEMENT_IMAGE =
  '/marketplaces/supplements-empty-state.webp';

/**
 * Type guard to check if the product is a supplement (Product type with discount).
 */
export function isProduct(
  product: Product | Rx | HealthcareService,
): product is Product {
  return 'discount' in product && typeof product.discount === 'number';
}

/**
 * Type guard to check if the product is a healthcare service.
 */
export function isHealthcareService(
  product: Product | Rx | HealthcareService,
): product is HealthcareService {
  return 'supportsLabOrder' in product;
}

/**
 * Type guard to check if the product is a prescription (Rx type).
 */
export function isRx(product: Product | Rx | HealthcareService): product is Rx {
  return !isProduct(product) && !isHealthcareService(product);
}
