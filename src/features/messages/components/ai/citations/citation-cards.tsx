import { memo } from 'react';

import { useObservationBiomarkerIndex } from '../../../hooks/use-observation-biomarker-index';
import { useProductIndex } from '../../../hooks/use-product-index';
import type { CitationInfo } from '../../../types/message-parts';
import { buildCarouselProducts } from '../../../utils/build-carousel-products';
import { groupCitationsForDisplay } from '../../../utils/group-citations-for-display';

import { ProductCarousel } from './product-carousel';
import { SmartCitationCard } from './smart-citation-card';

interface CitationCardsProps {
  messageId: string;
  blockKey: string;
  citations: CitationInfo[];
}

/**
 * Renders citation cards for a paragraph, handling grouping and carousels.
 * Groups multiple products into a carousel, renders other citations individually.
 */
export const CitationCards = memo(function CitationCards({
  messageId,
  blockKey,
  citations,
}: CitationCardsProps) {
  // Lift hooks here - called once per paragraph instead of per card
  const observationIndex = useObservationBiomarkerIndex();
  const productIndex = useProductIndex();

  if (citations.length === 0) {
    return null;
  }

  const groups = groupCitationsForDisplay(citations);

  return (
    <div className="mt-2 flex flex-col gap-2">
      {groups.map((group, groupIndex) => {
        if (group.type === 'product-carousel') {
          const products = buildCarouselProducts(group.citations, productIndex);

          if (products.length >= 2) {
            return (
              <ProductCarousel
                key={`${blockKey}:carousel:${groupIndex}`}
                messageId={messageId}
                products={products}
              />
            );
          }

          // Fall back to individual cards if products couldn't be resolved
          return group.citations.map((c) => (
            <SmartCitationCard
              key={`${blockKey}:cite:${c.number}`}
              messageId={messageId}
              citation={c}
              observationIndex={observationIndex}
              productIndex={productIndex}
            />
          ));
        }

        return (
          <SmartCitationCard
            key={`${blockKey}:cite:${group.citation.number}`}
            messageId={messageId}
            citation={group.citation}
            observationIndex={observationIndex}
            productIndex={productIndex}
          />
        );
      })}
    </div>
  );
});
