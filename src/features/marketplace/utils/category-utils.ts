import {
  MARKETPLACE_CATEGORIES,
  MarketplaceCategoryKey,
  MarketplaceFilter,
  MarketplaceTabValue,
} from '@/features/marketplace/const/categories';

const MARKETPLACE_ALL_LABELS: Record<
  'all',
  Record<Exclude<MarketplaceTabValue, 'all'> | 'all', string>
> = {
  all: {
    all: 'Total Health',
    tests: 'All Tests',
    supplements: 'All Supplements',
    prescriptions: 'All Prescriptions',
    orders: 'All Orders',
  },
};

export const getAllLabelForTab = (activeTab: MarketplaceTabValue) => {
  return MARKETPLACE_ALL_LABELS.all[activeTab];
};

export const getCategoryByKey = (key: MarketplaceCategoryKey) =>
  MARKETPLACE_CATEGORIES.find((c) => c.key === key);

export const getFilterDisplayLabel = (
  filter: MarketplaceFilter,
  activeTab: MarketplaceTabValue,
) => {
  if (filter === 'all') return getAllLabelForTab(activeTab);
  return getCategoryByKey(filter)?.label ?? String(filter);
};

export const matchesClassification = (
  classifications: Array<string | undefined> | undefined | null,
  filter: MarketplaceFilter,
) => {
  if (filter === 'all') return true;
  if (!classifications || classifications.length === 0) return false;

  const category = getCategoryByKey(filter);
  if (!category) return false;

  const allowed = new Set(category.tags.map((t) => t.trim().toLowerCase()));

  return classifications.some((classification) => {
    const normalized = classification?.trim().toLowerCase();
    return normalized ? allowed.has(normalized) : false;
  });
};
