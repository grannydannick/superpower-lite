import { useDeferredValue, useMemo } from 'react';

import { mostRecent } from '@/features/data/utils/most-recent-biomarker';
import { Biomarker, RequestGroup } from '@/types/api';

import { useDataFilterStore } from '../stores/data-filter-store';
import { StatusFilterOptionType } from '../types/filters';

interface FilterBiomarkersParams {
  biomarkers: Biomarker[];
  selectedCategories: string[];
  selectedOrder?: RequestGroup;
  selectedRange?: StatusFilterOptionType;
  searchQuery: string;
}

interface FilterConfig {
  categories?: boolean;
  date?: boolean;
  range?: boolean;
  search?: boolean;
}

export const filterBiomarkers = ({
  biomarkers,
  selectedCategories,
  selectedOrder,
  selectedRange,
  searchQuery,
}: FilterBiomarkersParams): Biomarker[] => {
  if (!biomarkers) return [];

  let filtered = biomarkers;

  if (selectedCategories.length > 0) {
    filtered = filtered.filter((b) => selectedCategories.includes(b.category));
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const searchTerm = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((biomarker) => {
      const name = biomarker.name.toLowerCase();
      const category = biomarker.category.toLowerCase();
      return name.includes(searchTerm) || category.includes(searchTerm);
    });
  }

  if (selectedRange && selectedRange !== 'all') {
    filtered = filtered.filter((biomarker) => {
      const mostRecentResult = mostRecent(biomarker.value);
      if (!mostRecentResult) return false;

      const status = mostRecentResult.status || biomarker.status;

      switch (selectedRange) {
        case 'optimal':
          return status === 'OPTIMAL';
        case 'normal':
          return status === 'NORMAL';
        case 'out of range':
          return status === 'HIGH' || status === 'LOW';
        default:
          return true;
      }
    });
  }

  if (selectedOrder) {
    const selectedOrderIds = selectedOrder.orders.map((o) => o.id);

    // only filter which biomarkers are shown (those that have a value for this order/date),
    // but keep each biomarker's full value history intact for charts and dialogs.
    filtered = filtered.filter((biomarker) =>
      biomarker.value.some((result) =>
        result.orderIds.some((orderId) => selectedOrderIds.includes(orderId)),
      ),
    );
  }

  return filtered;
};

interface UseFilteredBiomarkersParams {
  biomarkers?: Biomarker[];
  enabledFilters?: FilterConfig;
}

export const useFilteredBiomarkers = ({
  biomarkers,
  enabledFilters = { categories: true, date: true, range: true, search: true },
}: UseFilteredBiomarkersParams): Biomarker[] => {
  const { selectedCategories, selectedOrder, selectedRange, searchQuery } =
    useDataFilterStore();
  const deferredQuery = useDeferredValue(searchQuery);

  return useMemo(() => {
    if (!biomarkers) return [];

    return filterBiomarkers({
      biomarkers,
      selectedCategories: enabledFilters.categories ? selectedCategories : [],
      selectedOrder: enabledFilters.date ? selectedOrder : undefined,
      selectedRange: enabledFilters.range ? selectedRange : undefined,
      searchQuery: enabledFilters.search ? deferredQuery : '',
    });
  }, [
    biomarkers,
    selectedCategories,
    selectedOrder,
    selectedRange,
    deferredQuery,
    enabledFilters.categories,
    enabledFilters.date,
    enabledFilters.range,
    enabledFilters.search,
  ]);
};
