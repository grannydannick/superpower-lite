import { memo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import type { Biomarker } from '@/types/api';

import type { ProductIndex } from '../../../hooks/use-product-index';
import type { CitationInfo } from '../../../types/message-parts';
import { isInlineOnlyCitation } from '../../../utils/citation-tooltip';
import { parseFhirObservationCitation } from '../../../utils/parse-fhir-citation';
import {
  parseMarketplaceCitation,
  resolveMarketplaceProduct,
} from '../../../utils/parse-marketplace-citation';

import { BiomarkerCitationCard } from './biomarker-citation-card';
import { CitationCard } from './citation-card';
import { ProductCitationCard } from './product-citation-card';

interface SmartCitationCardProps {
  messageId: string;
  citation: CitationInfo;
  observationIndex: Map<string, Biomarker>;
  productIndex: ProductIndex;
}

/**
 * Smart citation card that dispatches to the appropriate card type.
 * - Memory, FHIR Patient, Chat citations → null (inline marker only with tooltip)
 * - FHIR Observation citations with matching biomarker → BiomarkerCitationCard
 * - FHIR Observation without biomarker yet → BiomarkerCitationSkeleton
 * - Marketplace product citations → ProductCitationCard (single) or handled by carousel
 * - All other citations → default CitationCard accordion
 *
 * Indexes are passed as props to avoid calling hooks per-card (perf optimization).
 */
export const SmartCitationCard = memo(function SmartCitationCard({
  messageId,
  citation,
  observationIndex,
  productIndex,
}: SmartCitationCardProps) {
  // Check if this citation type should only show inline markers (no card)
  if (isInlineOnlyCitation(citation.source)) {
    return null;
  }

  // Try to parse as FHIR Observation (biomarkers get rich cards)
  const fhirParsed = parseFhirObservationCitation(citation);
  if (fhirParsed) {
    const biomarker = observationIndex.get(fhirParsed.observationId);
    if (biomarker) {
      return (
        <BiomarkerCitationCard
          messageId={messageId}
          citation={citation}
          biomarker={biomarker}
        />
      );
    }
    // Biomarker data not loaded yet - show skeleton
    return <Skeleton className="h-[76px] w-full rounded-[20px]" />;
  }

  // Try to parse as Marketplace product
  const marketplaceParsed = parseMarketplaceCitation(citation);
  if (marketplaceParsed) {
    const product = resolveMarketplaceProduct(marketplaceParsed, productIndex);
    if (product) {
      return (
        <ProductCitationCard
          messageId={messageId}
          citation={citation}
          product={product}
        />
      );
    }
    if (productIndex.size === 0) {
      // Product data not loaded yet - show skeleton
      return <Skeleton className="h-[76px] w-full rounded-[20px]" />;
    }
    // Product not found in marketplace - hide the citation card
    return null;
  }

  // Default - use accordion
  return <CitationCard messageId={messageId} citation={citation} />;
});
