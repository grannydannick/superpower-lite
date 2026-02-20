import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import {
  AllProducts,
  Supplements,
  Tests,
} from '@/components/icons/marketplace';
import { Prescriptions } from '@/components/icons/marketplace/prescriptions';
import {
  TabsContent,
  TabsList,
  TabsTrigger,
  URLTabs,
} from '@/components/ui/slider-tabs';
import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import { MarketplaceFilters } from '@/features/marketplace/components/marketplace-filters';
import { MarketplaceList } from '@/features/marketplace/components/marketplace-list';
import { MarketplaceSearch } from '@/features/marketplace/components/marketplace-search';
import {
  MarketplaceFilter,
  MarketplaceTabValue,
} from '@/features/marketplace/const/categories';
import { useMarketplaceSearch } from '@/features/marketplace/hooks/use-marketplace-search';
import { PrescriptionsList } from '@/features/prescriptions/components/prescription-list';
import { ServicesList } from '@/features/services/components/services-list';
import { SupplementsList } from '@/features/supplements/components/supplements-list';
import { useAnalytics } from '@/hooks/use-analytics';

type MarketplaceTab = {
  value: MarketplaceTabValue;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  contentTitle?: string;
  render: () => ReactNode;
};

export const MarketplaceTabs = () => {
  const { data, isLoading } = useMarketplace();
  const [searchParams, setSearchParams] = useSearchParams();
  const { track } = useAnalytics();
  const rawTab = searchParams.get('tab');
  const activeTab: MarketplaceTabValue =
    rawTab === 'tests' ||
    rawTab === 'supplements' ||
    rawTab === 'prescriptions' ||
    rawTab === 'orders'
      ? rawTab
      : 'all';
  const [filter, setFilter] = useState<MarketplaceFilter>('all');
  const {
    query,
    setQuery: setSearchQuery,
    searchTitle,
    isSearching,
  } = useMarketplaceSearch();

  const ensureAllTabActive = useCallback(() => {
    setSearchParams((params) => {
      if (!params.has('tab')) {
        return params;
      }

      params.delete('tab');
      return params;
    });
  }, [setSearchParams]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    ensureAllTabActive();
  }, [ensureAllTabActive, setSearchQuery]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      ensureAllTabActive();
    },
    [ensureAllTabActive, setSearchQuery],
  );

  const tabs = useMemo<MarketplaceTab[]>(() => {
    const render = () => (
      <MarketplaceList
        services={data?.services}
        supplements={data?.supplements}
        prescriptions={data?.prescriptions}
        isLoading={isLoading}
        filter={filter}
        query={query}
        onClearSearch={handleClearSearch}
      />
    );

    return [
      {
        value: 'all',
        label: 'All Products',
        icon: AllProducts,
        contentTitle: searchTitle,
        render: render,
      },
      /* TESTS */
      {
        value: 'tests',
        label: 'Tests',
        icon: Tests,
        contentTitle: searchTitle,
        render: () => (
          <ServicesList
            services={data?.services}
            isLoading={isLoading}
            filter={filter}
            query={query}
          />
        ),
      },
      /* SUPPLEMENTS */
      {
        value: 'supplements',
        label: 'Supplements',
        icon: Supplements,
        contentTitle: searchTitle,
        render: () => (
          <SupplementsList
            products={data?.supplements}
            isLoading={isLoading}
            filter={filter}
            query={query}
          />
        ),
      },
      /* PRESCRIPTIONS */
      {
        value: 'prescriptions',
        label: 'Prescriptions',
        icon: Prescriptions,
        contentTitle: searchTitle,
        render: () => (
          <PrescriptionsList
            prescriptions={data?.prescriptions}
            isLoading={isLoading}
            filter={filter}
            query={query}
          />
        ),
      },
    ];
  }, [data, filter, handleClearSearch, isLoading, query, searchTitle]);

  const showFilters = activeTab !== 'orders';
  const tabClickEvents: Partial<Record<MarketplaceTabValue, string>> = {
    tests: 'click_marketplace_tests',
    supplements: 'click_marketplace_supplements',
    prescriptions: 'click_marketplace_prescriptions',
  };

  return (
    <URLTabs>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <TabsList
            hidden={activeTab === 'orders'}
            className="w-fit items-center justify-start gap-2 self-start overflow-x-auto md:w-fit"
          >
            {tabs
              .filter((tab) => tab.value !== 'orders')
              .map((tab) => {
                const Icon = tab.icon;
                const isDisabled = isSearching && tab.value !== 'all';

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    aria-label={tab.label}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                    onClick={() => {
                      const eventName = tabClickEvents[tab.value];
                      if (eventName) {
                        track(eventName);
                      }
                    }}
                  >
                    <>
                      {Icon ? <Icon className="size-5" /> : null}
                      <span className={Icon ? 'hidden sm:inline' : undefined}>
                        {tab.label}
                      </span>
                    </>
                  </TabsTrigger>
                );
              })}
          </TabsList>

          {activeTab !== 'orders' && (
            <MarketplaceSearch
              value={query}
              onChange={handleSearchChange}
              className="w-full md:w-72"
            />
          )}
        </div>
        {showFilters && (
          <MarketplaceFilters
            activeTab={activeTab}
            value={filter}
            onChange={setFilter}
          />
        )}
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="py-6 md:py-10"
        >
          {tab.render()}
        </TabsContent>
      ))}
    </URLTabs>
  );
};
