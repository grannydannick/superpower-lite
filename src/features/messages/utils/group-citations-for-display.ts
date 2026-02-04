import type { CitationInfo } from '../types/message-parts';

import { isMarketplaceCitation } from './parse-marketplace-citation';

export type CitationGroup =
  | { type: 'single'; citation: CitationInfo }
  | { type: 'product-carousel'; citations: CitationInfo[] };

/**
 * Groups citations maintaining citation number order.
 * If 2+ products in paragraph: ALL products shown in ONE carousel at first product's position.
 * If 1 product: shown as single card in its natural position.
 * Other citations (biomarkers, etc.) shown individually.
 */
export function groupCitationsForDisplay(
  citationsToGroup: CitationInfo[],
): CitationGroup[] {
  // Collect all products first to determine if we need a carousel
  const allProducts = citationsToGroup.filter((c) =>
    isMarketplaceCitation(c.source),
  );
  const useCarousel = allProducts.length >= 2;

  const groups: CitationGroup[] = [];
  let carouselAdded = false;

  for (const citation of citationsToGroup) {
    if (isMarketplaceCitation(citation.source)) {
      if (useCarousel) {
        // Multiple products: add carousel once at first product's position
        if (!carouselAdded) {
          groups.push({ type: 'product-carousel', citations: allProducts });
          carouselAdded = true;
        }
        // Skip subsequent products (already in carousel)
      } else {
        // Single product: show as individual card
        groups.push({ type: 'single', citation });
      }
    } else {
      // Non-product: always show individually
      groups.push({ type: 'single', citation });
    }
  }

  return groups;
}
