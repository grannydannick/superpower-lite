import type { operations } from '@/orpc/types.generated';

type Product =
  operations['marketplace.getProduct']['responses'][200]['content']['application/json']['product'];

type ProductPurchaseLink =
  | {
      available: true;
      href: string;
      label: string;
    }
  | {
      available: false;
      unavailableReason: string;
    };

export function getProductPurchaseLink(product: Product): ProductPurchaseLink {
  if (product.type === 'prescription') {
    // we currently use the legacy service id to bridge between the marketplace and the legacy RX PDP
    const legacyServiceId = product.legacy?.id;
    if (!legacyServiceId)
      return {
        available: false,
        unavailableReason: 'Unavailable',
      };

    return {
      available: true,
      href: `/prescriptions/${legacyServiceId}`,
      label: 'Get started',
    };
  }

  if (product.type === 'diagnostic_test') {
    if (!product.legacy?.id)
      return {
        available: false,
        unavailableReason: 'Unavailable',
      };

    return {
      available: true,
      href: `/marketplace/products/${product.slug}/checkout`,
      label: 'Get tested',
    };
  }

  // Supplements not yet supported
  return {
    available: false,
    unavailableReason: 'Unavailable',
  };
}
