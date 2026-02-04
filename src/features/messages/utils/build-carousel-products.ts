import type { HealthcareService, Product, Rx } from '@/types/api';

import type { ProductIndex } from '../hooks/use-product-index';
import type { CitationInfo } from '../types/message-parts';

import {
  parseMarketplaceCitation,
  resolveMarketplaceProduct,
} from './parse-marketplace-citation';

export interface ProductWithCitation {
  product: Product | Rx | HealthcareService;
  citation: CitationInfo;
}

/**
 * Resolves citations to products for carousel display.
 * Filters out citations that can't be resolved to products.
 */
export function buildCarouselProducts(
  citations: CitationInfo[],
  productIndex: ProductIndex,
): ProductWithCitation[] {
  return citations
    .map((citation) => {
      const parsed = parseMarketplaceCitation(citation);
      if (!parsed) {
        return null;
      }
      const product = resolveMarketplaceProduct(parsed, productIndex);
      if (!product) {
        return null;
      }
      return { product, citation };
    })
    .filter((p): p is ProductWithCitation => p !== null);
}
