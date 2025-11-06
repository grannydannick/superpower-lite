import { MarketplaceFilter } from '@/features/marketplace/components/marketplace-filters';
import { MarketplaceSkeleton } from '@/features/marketplace/components/marketplace-skeleton';
import { getMarketplaceSearchMeta } from '@/features/marketplace/helper/get-marketplace-search-meta';
import { matchesMarketplaceQuery } from '@/features/marketplace/utils/matches-marketplace-query';
import { Rx } from '@/types/api';

import { PrescriptionsCategory } from './prescriptions-category';

type PrescriptionsListProps = {
  prescriptions?: Rx[];
  isLoading?: boolean;
  filter?: MarketplaceFilter;
  query?: string;
};

export const PrescriptionsList = ({
  prescriptions,
  isLoading,
  filter = 'all',
  query = '',
}: PrescriptionsListProps) => {
  if (isLoading) return <MarketplaceSkeleton />;
  if (!prescriptions) return null;
  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-4 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-secondary">
        <p>Prescriptions are not available in your state yet.</p>
      </div>
    );
  }

  const {
    trimmedQuery,
    normalizedQuery,
    isFiltered,
    isSearching,
    filterTitle,
    titleOverride,
    subtitleOverride,
  } = getMarketplaceSearchMeta(query, filter);

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    matchesMarketplaceQuery(prescription, filter, normalizedQuery),
  );

  let sections: {
    title: string;
    subtitle?: string;
    prescriptions: Rx[];
  }[] = [];

  if (isFiltered || isSearching) {
    if (filteredPrescriptions.length) {
      sections.push({
        title: titleOverride ?? filterTitle,
        subtitle: subtitleOverride,
        prescriptions: filteredPrescriptions,
      });
    }
  } else {
    sections = [
      {
        title: 'Browse all prescriptions',
        prescriptions: prescriptions,
      },
    ].filter(({ prescriptions }) => prescriptions.length > 0);
  }

  if ((isFiltered || isSearching) && !filteredPrescriptions.length) {
    return (
      <div className="flex flex-col items-center space-y-4 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-secondary">
        <p>
          {isSearching
            ? `No prescriptions found for "${trimmedQuery}".`
            : `No prescriptions available for "${filter}" right now.`}
        </p>
      </div>
    );
  }

  if (!sections.length) return null;

  return (
    <div className="flex flex-col gap-14">
      {sections.map(({ title, subtitle, prescriptions }) => (
        <PrescriptionsCategory
          key={title}
          title={title}
          subtitle={subtitle}
          prescriptions={prescriptions}
        />
      ))}
    </div>
  );
};
