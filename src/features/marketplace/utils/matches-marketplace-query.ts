import { MarketplaceFilter } from '@/features/marketplace/components/marketplace-filters';
import { filterByCategory } from '@/features/marketplace/utils/filter-by-categoty';

type MarketplaceEntity = {
  name: string;
  additionalClassification?: string[] | null;
  vendor?: string | null;
};

export const matchesMarketplaceQuery = <T extends MarketplaceEntity>(
  item: T,
  filter: MarketplaceFilter,
  normalizedSearch: string,
) => {
  if (!filterByCategory(item.additionalClassification, filter)) {
    return false;
  }

  if (!normalizedSearch) {
    return true;
  }

  if (item.name.toLowerCase().includes(normalizedSearch)) {
    return true;
  }

  const vendor = item.vendor?.toLowerCase();

  if (vendor && vendor.includes(normalizedSearch)) {
    return true;
  }

  return (item.additionalClassification ?? []).some((classification) =>
    classification.toLowerCase().includes(normalizedSearch),
  );
};
