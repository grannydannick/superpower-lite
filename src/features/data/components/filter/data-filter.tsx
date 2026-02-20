import { useEffect, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { Body1, Body2 } from '@/components/ui/typography';
import { useIsIntersecting } from '@/hooks/use-sticky-state';
import { cn } from '@/lib/utils';

import { useDataFilterStore } from '../../stores/data-filter-store';
import { BiomarkersDistributionBar } from '../biomarkers-distribution-bar';

import { CategoryFilter } from './category-filter';
import { DataSearch } from './data-search';
import { DateFilter } from './date-filter';
import { RangesFilter } from './ranges-filter';

export const DataFilter = ({ isLoading }: { isLoading: boolean }) => {
  const { isIntersecting, sentinelRef } = useIsIntersecting();
  const searchQuery = useDataFilterStore((s) => s.searchQuery);
  const updateSearchQuery = useDataFilterStore((s) => s.updateSearchQuery);

  const [localQuery, setLocalQuery] = useState(searchQuery);
  useEffect(() => setLocalQuery(searchQuery), [searchQuery]);
  const [_, startTransition] = useTransition();
  const debouncedUpdate = useDebouncedCallback((q: string) => {
    startTransition(() => updateSearchQuery(q));
  }, 200);

  return (
    <>
      {/* adjust the y axis value of the sentinelRef to define where the component shrinks down on the page */}
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none h-0 -translate-y-32"
      />
      <div
        className={cn(
          'sticky top-0 z-10 bg-gradient-to-b from-zinc-50 to-transparent transition-all duration-500 md:top-0',
          isIntersecting && 'pt-4 md:pt-20',
        )}
      >
        <div
          className={cn(
            'mx-auto flex-1 overflow-y-auto rounded-3xl border border-white bg-white shadow-md shadow-black/[.02] transition-all scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300',
            isIntersecting && 'border-zinc-100 shadow-xl shadow-black/[.03]',
          )}
        >
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                'flex flex-col gap-2 overflow-hidden p-6 pb-0 transition-all duration-500',
                isIntersecting ? '-mt-[41px] max-h-0' : 'max-h-64 md:max-h-40',
              )}
            >
              <Body2 className="font-semibold">Biomarkers</Body2>
              {isLoading ? (
                <div className="animate-pulse space-y-1 pb-8">
                  <div className="flex size-full items-center justify-center gap-4">
                    <Body1 className="flex-1 text-zinc-400">
                      <span className="text-black">0</span> Optimal markers
                    </Body1>
                    <Body1 className="flex-1 text-zinc-400">
                      <span className="text-black">0</span> In range markers
                    </Body1>
                    <Body1 className="flex-1 text-zinc-400">
                      <span className="text-black">0</span> Out of range markers
                    </Body1>
                  </div>
                  <div className="flex size-full items-center justify-center gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-1 flex-1 rounded-full bg-zinc-200"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <BiomarkersDistributionBar enableToggle />
              )}
            </div>
            {!isLoading && (
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
                  <CategoryFilter />
                  <DateFilter />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DataFilter;
