import { useMemo, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { cn } from '@/lib/utils';

import { useDataBiomarkers } from '../../api/get-data-biomarkers';
import { useFilteredBiomarkers } from '../../hooks/use-filtered-biomarkers';
import { useDataFilterStore } from '../../stores/data-filter-store';
import type { DataSummaryCategory } from '../../types/data-api';
import { DataSearch } from '../filter/data-search';
import { DateFilter } from '../filter/date-filter';
import { RangesFilter } from '../filter/ranges-filter';

import { BiomarkersDataTable } from './biomarkers-data-table';
import { ProductCardsList } from './product-cards-list';

export const CategoryDataTable = ({
  category,
}: {
  category?: DataSummaryCategory;
}) => {
  const searchQuery = useDataFilterStore((s) => s.searchQuery);
  const updateSearchQuery = useDataFilterStore((s) => s.updateSearchQuery);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const biomarkersQuery = useDataBiomarkers({ categorySlug: category?.slug });
  const biomarkers = useMemo(
    () => biomarkersQuery.data?.biomarkers ?? [],
    [biomarkersQuery.data],
  );

  const filteredBiomarkers = useFilteredBiomarkers({
    biomarkers,
    enabledFilters: { categories: false, date: true, range: true },
    includeUntested: true,
  });

  const [_, startTransition] = useTransition();

  const debouncedUpdate = useDebouncedCallback((q: string) => {
    startTransition(() => updateSearchQuery(q));
  }, 200);

  const isLoading = biomarkersQuery.isLoading;

  return (
    <div>
      <div className="space-y-3">
        <div
          className={cn(
            'sticky top-4 z-10 bg-gradient-to-b from-zinc-50 to-transparent transition-all duration-500 md:top-20',
          )}
        >
          <div
            className={cn(
              'mx-auto flex-1 overflow-y-auto rounded-3xl border border-zinc-100 bg-white shadow-md shadow-black/[.02] transition-all scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300',
            )}
          >
            <div className="flex flex-col gap-4">
              <div className="flex h-28 flex-col justify-between border-t border-t-zinc-100 py-2 md:h-auto md:flex-row md:items-center md:gap-4 md:px-3">
                <DataSearch
                  value={localQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setLocalQuery(q);
                    debouncedUpdate(q);
                  }}
                />
                <div className="flex items-center gap-1.5 px-2.5 md:px-0">
                  <RangesFilter />
                  <DateFilter />
                </div>
              </div>
            </div>
          </div>
        </div>
        {category?.products?.length ? (
          <ProductCardsList products={category.products} />
        ) : null}
      </div>

      <div className="mx-auto min-h-screen">
        <BiomarkersDataTable
          biomarkers={filteredBiomarkers}
          isLoading={isLoading}
          displayPending={true}
          currentCategory={category}
        />
      </div>
    </div>
  );
};
