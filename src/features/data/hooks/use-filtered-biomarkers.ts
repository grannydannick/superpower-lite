import { useDeferredValue, useMemo } from 'react';

import { mostRecent } from '@/features/data/utils/most-recent-biomarker';
import type { RequestGroup } from '@/types/api';

import { useDataFilterStore } from '../stores/data-filter-store';
import type { DataBiomarker } from '../types/data-api';
import { StatusFilterOptionType } from '../types/filters';

interface FilterBiomarkersParams {
  biomarkers: DataBiomarker[];
  selectedCategories: string[];
  selectedOrder?: RequestGroup;
  selectedRange?: StatusFilterOptionType;
  searchQuery: string;
  includeUntested?: boolean;
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
  includeUntested = false,
}: FilterBiomarkersParams): DataBiomarker[] => {
  let filtered = biomarkers.filter((b) => {
    if (b.observation != null) return true;
    if (b.hidden) return false;
    if (
      !b.diagnosticTests.some((dt) =>
        dt.products.some((p) => p.status === 'published'),
      )
    )
      return false;
    return includeUntested;
  });

  if (selectedCategories.length > 0) {
    const selectedCategorySet = new Set(selectedCategories);
    const next: DataBiomarker[] = [];

    for (const biomarker of filtered) {
      if (!biomarker.categories.some((c) => selectedCategorySet.has(c.slug)))
        continue;
      next.push(biomarker);
    }

    filtered = next;
  }

  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery !== '') {
    const searchTerm = trimmedQuery.toLowerCase();
    const next: DataBiomarker[] = [];

    for (const biomarker of filtered) {
      const title = biomarker.title.toLowerCase();
      const categoryMatch = biomarker.categories.some((c) =>
        c.title.toLowerCase().includes(searchTerm),
      );
      if (title.includes(searchTerm) || categoryMatch) {
        next.push(biomarker);
      }
    }

    filtered = next;
  }

  if (selectedRange != null && selectedRange !== 'all') {
    const next: DataBiomarker[] = [];

    for (const biomarker of filtered) {
      const mostRecentResult = mostRecent(biomarker.observation?.value ?? []);
      if (mostRecentResult == null) continue;

      const status = mostRecentResult.status ?? biomarker.observation?.status;

      switch (selectedRange) {
        case 'optimal':
          if (status === 'OPTIMAL') next.push(biomarker);
          break;
        case 'normal':
          if (status === 'NORMAL') next.push(biomarker);
          break;
        case 'out of range':
          if (status === 'HIGH' || status === 'LOW' || status === 'ABNORMAL')
            next.push(biomarker);
          break;
        default:
          next.push(biomarker);
      }
    }

    filtered = next;
  }

  if (selectedOrder != null) {
    const selectedOrderIdSet = new Set<string>();
    for (const order of selectedOrder.orders) {
      selectedOrderIdSet.add(order.id);
    }

    const next: DataBiomarker[] = [];

    for (const biomarker of filtered) {
      let hasSelectedOrder = false;

      for (const result of biomarker.observation?.value ?? []) {
        for (const orderId of result.orderIds) {
          if (!selectedOrderIdSet.has(orderId)) continue;
          hasSelectedOrder = true;
          break;
        }

        if (hasSelectedOrder) break;
      }

      if (!hasSelectedOrder) continue;
      next.push(biomarker);
    }

    filtered = next;
  }

  return filtered;
};

interface UseFilteredBiomarkersParams {
  biomarkers?: DataBiomarker[];
  enabledFilters?: FilterConfig;
  includeUntested?: boolean;
}

export const useFilteredBiomarkers = ({
  biomarkers,
  enabledFilters,
  includeUntested = false,
}: UseFilteredBiomarkersParams): DataBiomarker[] => {
  const { selectedCategories, selectedOrder, selectedRange, searchQuery } =
    useDataFilterStore();
  const deferredQuery = useDeferredValue(searchQuery);

  const categoriesEnabled = enabledFilters?.categories ?? true;
  const dateEnabled = enabledFilters?.date ?? true;
  const rangeEnabled = enabledFilters?.range ?? true;
  const searchEnabled = enabledFilters?.search ?? true;

  return useMemo(() => {
    if (biomarkers == null) return [];

    return filterBiomarkers({
      biomarkers,
      includeUntested,
      selectedCategories: categoriesEnabled ? selectedCategories : [],
      selectedOrder: dateEnabled ? selectedOrder : undefined,
      selectedRange: rangeEnabled ? selectedRange : undefined,
      searchQuery: searchEnabled ? deferredQuery : '',
    });
  }, [
    biomarkers,
    selectedCategories,
    selectedOrder,
    selectedRange,
    deferredQuery,
    categoriesEnabled,
    dateEnabled,
    rangeEnabled,
    searchEnabled,
    includeUntested,
  ]);
};
