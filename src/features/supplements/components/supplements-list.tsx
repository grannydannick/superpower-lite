import { MarketplaceFilter } from '@/features/marketplace/components/marketplace-filters';
import { MarketplaceSkeleton } from '@/features/marketplace/components/marketplace-skeleton';
import { getMarketplaceSearchMeta } from '@/features/marketplace/helper/get-marketplace-search-meta';
import { matchesMarketplaceQuery } from '@/features/marketplace/utils/matches-marketplace-query';
import { useProgressiveReveal } from '@/hooks/use-progressive-reveal';
import { Product } from '@/types/api';
import { isMobile } from '@/utils/browser-detection';

import { getRecomendedSupplements } from '../utils/get-recommended-supplements';
import {
  SupplementsCategory,
  groupSupplementsByCategory,
} from '../utils/group-supplements-by-category';

import { SupplementCategory } from './supplement-category';

type SupplementsListProps = {
  products?: Product[];
  isLoading?: boolean;
  filter?: MarketplaceFilter;
  query?: string;
};

const INITIAL_SECTION_COUNT = isMobile() ? 1 : 3;

export const SupplementsList = ({
  products,
  isLoading,
  filter = 'all',
  query = '',
}: SupplementsListProps) => {
  const {
    normalizedQuery,
    isFiltered,
    isSearching,
    filterTitle,
    titleOverride,
    subtitleOverride,
  } = getMarketplaceSearchMeta(query, filter);

  const filteredSupplements = (products ?? []).filter((product) =>
    matchesMarketplaceQuery(product, filter, normalizedQuery),
  );

  const sections: SupplementsCategory = [];

  if (isFiltered || isSearching) {
    if (filteredSupplements.length) {
      sections.push({
        title: titleOverride ?? filterTitle,
        subtitle: subtitleOverride,
        products: filteredSupplements,
      });
    }
  } else {
    const categories = groupSupplementsByCategory(filteredSupplements);
    const recommended = getRecomendedSupplements(filteredSupplements);

    if (recommended.length) {
      sections.push({
        title: 'Top supplements for you',
        subtitle: 'Most recommended',
        products: recommended,
      });
    }

    sections.push(...categories);
  }

  const { visibleCount, hasMore, sentinelRef } = useProgressiveReveal({
    totalCount: sections.length,
    pageSize: INITIAL_SECTION_COUNT,
    resetDeps: [products, filter, query],
  });

  const renderedSections = sections.slice(0, visibleCount);

  if (isLoading) return <MarketplaceSkeleton />;

  if (!filteredSupplements.length || !sections.length) return null;

  return (
    <div className="flex flex-col gap-14">
      {renderedSections.map(({ title, subtitle, products }) => (
        <SupplementCategory
          key={title}
          title={title}
          subtitle={subtitle}
          products={products}
        />
      ))}
      {/* Threshold for progressive scroll */}
      {hasMore && <div ref={sentinelRef} className="h-1" />}
    </div>
  );
};
