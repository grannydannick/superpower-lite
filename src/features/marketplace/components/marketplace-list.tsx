import { Button } from '@/components/ui/button';
import { H2 } from '@/components/ui/typography';
import { MarketplaceFilter } from '@/features/marketplace/components/marketplace-filters';
import { MarketplaceSkeleton } from '@/features/marketplace/components/marketplace-skeleton';
import { getMarketplaceSearchMeta } from '@/features/marketplace/helper/get-marketplace-search-meta';
import { matchesMarketplaceQuery } from '@/features/marketplace/utils/matches-marketplace-query';
import { PrescriptionCard } from '@/features/prescriptions/components/prescriptions-card';
import { PrescriptionsCategory } from '@/features/prescriptions/components/prescriptions-category';
import { getRecommendedPrescriptions } from '@/features/prescriptions/utils/get-recommended-prescriptions';
import { ServiceCard } from '@/features/services/components/service-card';
import { ServiceCategory } from '@/features/services/components/service-category';
import { getRecommendedServices } from '@/features/services/utils/get-recommended-services';
import { SupplementCard } from '@/features/supplements/components/supplement-card';
import { SupplementCategory } from '@/features/supplements/components/supplement-category';
import { getRecomendedSupplements } from '@/features/supplements/utils/get-recommended-supplements';
import { useProgressiveReveal } from '@/hooks/use-progressive-reveal';
import { HealthcareService, Product, Rx } from '@/types/api';

const SEARCH_PAGE_SIZE = 12;

type MarketplaceListProps = {
  services?: HealthcareService[];
  supplements?: Product[];
  prescriptions?: Rx[];
  isLoading?: boolean;
  filter: MarketplaceFilter;
  query?: string;
  onClearSearch?: () => void;
};

export const MarketplaceList = ({
  services,
  supplements,
  prescriptions,
  isLoading,
  filter,
  query = '',
  onClearSearch,
}: MarketplaceListProps) => {
  if (isLoading) return <MarketplaceSkeleton />;

  const {
    trimmedQuery,
    normalizedQuery,
    isFiltered,
    isSearching,
    resultsTitle,
    resultsSubtitle,
  } = getMarketplaceSearchMeta(query, filter);

  const filteredServices = (services ?? []).filter((service) =>
    matchesMarketplaceQuery(service, filter, normalizedQuery),
  );

  const filteredSupplements = (supplements ?? []).filter((product) =>
    matchesMarketplaceQuery(product, filter, normalizedQuery),
  );

  const filteredPrescriptions = (prescriptions ?? []).filter((prescription) =>
    matchesMarketplaceQuery(prescription, filter, normalizedQuery),
  );

  const clearQueryButton = isSearching && !!onClearSearch;

  if (
    !filteredServices.length &&
    !filteredSupplements.length &&
    !filteredPrescriptions.length
  ) {
    return (
      <div className="flex flex-col items-center space-y-4 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-secondary">
        <p>
          {isSearching
            ? `No results found for “${trimmedQuery}”.`
            : filter === 'all'
              ? 'No products available right now.'
              : `No products available for “${filter}” right now.`}
        </p>
        {clearQueryButton ? (
          <Button variant="outline" size="medium" onClick={onClearSearch}>
            Clear search
          </Button>
        ) : null}
      </div>
    );
  }

  if (isFiltered || isSearching) {
    return (
      <MarketplaceFilteredCategory
        title={resultsTitle}
        subtitle={resultsSubtitle}
        products={filteredSupplements}
        services={filteredServices}
        prescriptions={filteredPrescriptions}
        resetKey={`${filter}-${trimmedQuery}`}
      />
    );
  }

  const recommendedServices = getRecommendedServices(filteredServices);
  const recommendedSupplements = getRecomendedSupplements(filteredSupplements);
  const recommendedPrescriptions = getRecommendedPrescriptions(
    filteredPrescriptions,
  );

  return (
    <div className="flex flex-col gap-14">
      {recommendedServices.length > 0 && (
        <ServiceCategory
          title="Top tests for you"
          subtitle="Most recommended"
          services={recommendedServices}
          path="?tab=tests"
        />
      )}
      {recommendedSupplements.length > 0 && (
        <SupplementCategory
          title="Top supplements for you"
          subtitle="Most recommended"
          products={recommendedSupplements}
          path="?tab=supplements"
        />
      )}
      {recommendedPrescriptions.length > 0 && (
        <PrescriptionsCategory
          title="Top prescriptions for you"
          subtitle="Most recommended"
          prescriptions={recommendedPrescriptions}
          path="?tab=prescriptions"
        />
      )}
    </div>
  );
};

type MarketplaceFilteredCategoryProps = {
  title: string;
  subtitle?: string;
  products: Product[];
  services: HealthcareService[];
  prescriptions: Rx[];
  resetKey?: string;
};

const MarketplaceFilteredCategory = ({
  title,
  subtitle,
  products,
  services,
  prescriptions,
  resetKey,
}: MarketplaceFilteredCategoryProps) => {
  const items = [
    ...services.map((service) => ({
      type: 'service' as const,
      id: service.id,
      node: <ServiceCard service={service} />,
    })),
    ...products.map((product) => ({
      type: 'product' as const,
      id: product.id,
      node: <SupplementCard product={product} />,
    })),
    ...prescriptions.map((prescription) => ({
      type: 'prescription' as const,
      id: prescription.id,
      node: <PrescriptionCard prescription={prescription} />,
    })),
  ];

  const { visibleCount, hasMore, sentinelRef } = useProgressiveReveal({
    totalCount: items.length,
    pageSize: SEARCH_PAGE_SIZE,
    resetDeps: [resetKey, items.length],
  });

  const visibleItems = items.slice(0, visibleCount);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col">
        <H2>{title}</H2>
        {subtitle && <H2 className="text-secondary">{subtitle}</H2>}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-4">
        {visibleItems.map(({ id, node, type }) => (
          <div key={`${type}-${id}`} className="flex flex-col">
            {node}
          </div>
        ))}
      </div>

      {hasMore ? <div ref={sentinelRef} className="h-1" /> : null}
    </section>
  );
};
