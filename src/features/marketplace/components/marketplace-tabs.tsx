import { Navigate, useNavigate, useSearch } from '@tanstack/react-router';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useCallback, useMemo, useState } from 'react';

import {
  AllProducts,
  Supplements,
  Tests,
} from '@/components/icons/marketplace';
import { Prescriptions } from '@/components/icons/marketplace/prescriptions';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
import { useUser } from '@/lib/auth';

type MarketplaceTab = {
  value: MarketplaceTabValue;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  contentTitle?: string;
  render: () => ReactNode;
};

export const MarketplaceTabs = () => {
  const { data, isLoading } = useMarketplace();
  const navigate = useNavigate({ from: '/marketplace' });
  const { track } = useAnalytics();
  const userQuery = useUser();
  const hasRxAccess =
    userQuery.isFetched && userQuery.data?.access?.rx !== false;
  const tab = useSearch({
    from: '/_app/marketplace',
    select: (s) => s.tab,
  });
  const activeTab: MarketplaceTabValue =
    tab === 'prescriptions' && !hasRxAccess ? 'all' : (tab ?? 'all');
  const [filter, setFilter] = useState<MarketplaceFilter>('all');
  const {
    query,
    setQuery: setSearchQuery,
    searchTitle,
    isSearching,
  } = useMarketplaceSearch();

  const ensureAllTabActive = useCallback(() => {
    if (tab == null) {
      return;
    }
    void navigate({
      search: (prev) => {
        return {
          ...prev,
          tab: undefined,
        };
      },
    });
  }, [navigate, tab]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === activeTab) {
        return;
      }
      if (value === 'all') {
        void navigate({
          search: (prev) => {
            return {
              ...prev,
              tab: undefined,
            };
          },
        });
        return;
      }

      if (
        value !== 'tests' &&
        value !== 'supplements' &&
        value !== 'prescriptions' &&
        value !== 'orders'
      ) {
        return;
      }

      void navigate({
        search: (prev) => {
          return {
            ...prev,
            tab: value,
          };
        },
      });
    },
    [activeTab, navigate],
  );

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
        prescriptions={hasRxAccess ? data?.prescriptions : undefined}
        isLoading={isLoading}
        filter={filter}
        query={query}
        onClearSearch={handleClearSearch}
      />
    );

    const allTabs: MarketplaceTab[] = [
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
    const visibleTabs: MarketplaceTab[] = [];
    for (const tab of allTabs) {
      if (tab.value === 'prescriptions' && !hasRxAccess) {
        continue;
      }
      visibleTabs.push(tab);
    }

    return visibleTabs;
  }, [
    data,
    filter,
    handleClearSearch,
    hasRxAccess,
    isLoading,
    query,
    searchTitle,
  ]);

  const showFilters = activeTab !== 'orders';
  const tabClickEvents: Partial<Record<MarketplaceTabValue, string>> = {
    tests: 'click_marketplace_tests',
    supplements: 'click_marketplace_supplements',
    prescriptions: 'click_marketplace_prescriptions',
  };

  if (userQuery.isFetched && tab === 'prescriptions' && !hasRxAccess) {
    return (
      <Navigate
        to="/marketplace"
        search={(prev) => {
          return {
            ...prev,
            tab: undefined,
          };
        }}
        replace={true}
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
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
    </Tabs>
  );
};
