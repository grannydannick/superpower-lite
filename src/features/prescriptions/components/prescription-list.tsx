import { MarketplaceSkeleton } from '@/features/marketplace/components/marketplace-skeleton';
import { MarketplaceFilter } from '@/features/marketplace/const/categories';
import { getFilterDisplayLabel } from '@/features/marketplace/utils/category-utils';
import { getMarketplaceSearchMeta } from '@/features/marketplace/utils/get-marketplace-search-meta';
import { matchesMarketplaceQuery } from '@/features/marketplace/utils/matches-marketplace-query';
import { useUser } from '@/lib/auth';
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
  const { data: user } = useUser();

  const primaryAddress = user?.primaryAddress;

  if (isLoading) return <MarketplaceSkeleton />;
  if (!prescriptions) return null;

  if (!primaryAddress) {
    return (
      <div className="flex flex-col items-center space-y-4 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center text-sm text-secondary">
        Please set a primary address to view available prescriptions.
      </div>
    );
  }

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
            : `No prescriptions available for "${getFilterDisplayLabel(filter, 'prescriptions')}" right now.`}
        </p>
      </div>
    );
  }

  if (!sections.length) return null;

  return (
    <div className="flex flex-col gap-14">
      {sections.map(({ title, subtitle, prescriptions }, index) => (
        <PrescriptionsCategory
          key={title}
          title={title}
          subtitle={subtitle}
          prescriptions={prescriptions}
          showDisclaimer={index === 0}
        />
      ))}
    </div>
  );
};
