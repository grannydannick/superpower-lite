import { MarketplaceSkeleton } from '@/features/marketplace/components/marketplace-skeleton';
import { MarketplaceFilter } from '@/features/marketplace/const/categories';
import { getFilterDisplayLabel } from '@/features/marketplace/utils/category-utils';
import { getMarketplaceSearchMeta } from '@/features/marketplace/utils/get-marketplace-search-meta';
import { matchesMarketplaceQuery } from '@/features/marketplace/utils/matches-marketplace-query';
import { getRecommendedServices } from '@/features/services/utils/get-recommended-services';
import { HealthcareService } from '@/types/api';

import { ServiceCategory } from './service-category';

type ServicesListProps = {
  services?: HealthcareService[];
  isLoading?: boolean;
  filter?: MarketplaceFilter;
  query?: string;
};

export const ServicesList = ({
  services,
  isLoading,
  filter = 'all',
  query = '',
}: ServicesListProps) => {
  if (isLoading) return <MarketplaceSkeleton />;
  if (!services) return null;

  const {
    trimmedQuery,
    normalizedQuery,
    isFiltered,
    isSearching,
    filterTitle,
    titleOverride,
    subtitleOverride,
  } = getMarketplaceSearchMeta(query, filter, 'tests');

  const filteredServices = services.filter((service) =>
    matchesMarketplaceQuery(service, filter, normalizedQuery),
  );

  let sections: {
    title: string;
    subtitle?: string;
    services: HealthcareService[];
  }[] = [];

  if (isFiltered || isSearching) {
    if (filteredServices.length) {
      sections = [
        {
          title: titleOverride ?? filterTitle,
          subtitle: subtitleOverride,
          services: filteredServices,
        },
      ];
    }
  } else {
    const recommended = getRecommendedServices(filteredServices);

    sections = [
      {
        title: 'Top tests for you',
        subtitle: 'Most recommended',
        services: recommended,
      },
      {
        title: 'Blood tests',
        services: filteredServices.filter((service) => service.phlebotomy),
      },
      {
        title: 'Other tests',
        services: filteredServices.filter((service) => !service.phlebotomy),
      },
    ].filter(({ services }) => services.length > 0);
  }

  if (!filteredServices.length) {
    return (
      <div className="flex flex-col items-center space-y-4 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-secondary">
        <p>
          {isSearching
            ? `No tests found for “${trimmedQuery}”.`
            : filter === 'all'
              ? 'No tests available right now.'
              : `No tests available for “${getFilterDisplayLabel(filter, 'tests')}” right now.`}
        </p>
      </div>
    );
  }

  if (!sections.length) return null;

  return (
    <div className="flex flex-col gap-14">
      {sections.map(({ title, subtitle, services }) => (
        <ServiceCategory
          key={title}
          title={title}
          subtitle={subtitle}
          services={services}
        />
      ))}
    </div>
  );
};
