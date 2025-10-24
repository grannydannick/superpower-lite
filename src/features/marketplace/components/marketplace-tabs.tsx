import { useCallback, useMemo, useState } from 'react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useSearchParams } from 'react-router-dom';

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
import { H2 } from '@/components/ui/typography';
import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import {
  MarketplaceFilter,
  MarketplaceFilters,
  MarketplaceTabValue,
} from '@/features/marketplace/components/marketplace-filters';
import { MarketplaceList } from '@/features/marketplace/components/marketplace-list';
import { MarketplaceSearch } from '@/features/marketplace/components/marketplace-search';
import { useMarketplaceSearch } from '@/features/marketplace/hooks/use-marketplace-search';
import { FinishScheduleList } from '@/features/services/components/finish-schedule-list';
import { OrdersList } from '@/features/services/components/orders-list';
import { ServicesList } from '@/features/services/components/services-list';
import { SupplementsList } from '@/features/supplements/components/supplements-list';

type MarketplaceTab = {
  value: MarketplaceTabValue;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  contentTitle?: string;
  render: () => ReactNode;
};

export const MarketplaceTabs = () => {
  const { data, isLoading } = useMarketplace();
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab: MarketplaceTabValue =
    rawTab === 'tests' || rawTab === 'supplements' || rawTab === 'orders'
      ? rawTab
      : 'all';
  const [filter, setFilter] = useState<MarketplaceFilter>('all');
  const {
    query: query,
    setQuery: setSearchQuery,
    searchTitle,
    isSearching,
  } = useMarketplaceSearch();

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const tabs = useMemo<MarketplaceTab[]>(() => {
    const render = () => (
      <MarketplaceList
        services={data?.services}
        supplements={data?.supplements}
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
        render: () => {
          if (isSearching) {
            return render();
          }

          return (
            <ServicesList
              services={data?.services}
              isLoading={isLoading}
              filter={filter}
              query={query}
            />
          );
        },
      },
      /* SUPPLEMENTS */
      {
        value: 'supplements',
        label: 'Supplements',
        icon: Supplements,
        contentTitle: searchTitle,
        render: () => {
          if (isSearching) {
            return render();
          }

          return (
            <SupplementsList
              products={data?.supplements}
              isLoading={isLoading}
              filter={filter}
              query={query}
            />
          );
        },
      },
      /* ORDERS - Hidden */
      {
        value: 'orders',
        label: 'Orders',
        render: () => <MarketplaceOrdersTab />,
      },
    ];
  }, [
    data,
    filter,
    handleClearSearch,
    isLoading,
    isSearching,
    query,
    searchTitle,
  ]);

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
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    aria-label={tab.label}
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
            <a
              className="relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-base font-medium text-secondary transition-colors duration-200 hover:text-primary"
              href="https://clinic.superpower.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Prescriptions"
            >
              <Prescriptions className="size-5" />
              <span className="hidden sm:inline">Prescriptions</span>
            </a>
          </TabsList>

          {activeTab !== 'orders' && (
            <MarketplaceSearch
              value={query}
              onChange={setSearchQuery}
              className="w-full md:w-72"
            />
          )}
        </div>
        {activeTab !== 'orders' && activeTab !== 'tests' && (
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
          className="py-6 md:py-14"
        >
          {tab.render()}
        </TabsContent>
      ))}
    </URLTabs>
  );
};

const MarketplaceOrdersTab = () => {
  return (
    <div className="flex flex-col gap-8 [&>*]:flex [&>*]:flex-col [&>*]:gap-6">
      <section>
        <H2>To be scheduled</H2>
        <FinishScheduleList />
      </section>
      <section>
        <H2>Past orders</H2>
        <OrdersList />
      </section>
    </div>
  );
};
