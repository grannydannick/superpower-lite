import { useEffect, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { SelectableCard } from '@/components/shared/selectable-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ENVIRONMENTAL_TOXINS_TEST_ID,
  GUT_MICROBIOME_ANALYSIS_ID,
  HEAVY_METALS_TEST_ID,
  MYCOTOXINS_TEST_ID,
} from '@/const';
import { useOrders } from '@/features/orders/api';
import { useService, useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';
import { Category, OrderStatus, SuperpowerCategory } from '@/types/api';
import { getServiceImage } from '@/utils/service';

import { useBiomarkers } from '../../api';
import { useFilteredBiomarkers } from '../../hooks/use-filtered-biomarkers';
import { useDataFilterStore } from '../../stores/data-filter-store';
import { DataSearch } from '../filter/data-search';
import { DateFilter } from '../filter/date-filter';
import { RangesFilter } from '../filter/ranges-filter';

import { BiomarkersDataTable } from './biomarkers-data-table';

export const CategoryDataTable = ({ category }: { category?: Category }) => {
  const searchQuery = useDataFilterStore((s) => s.searchQuery);
  const updateSearchQuery = useDataFilterStore((s) => s.updateSearchQuery);
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const [localQuery, setLocalQuery] = useState(searchQuery);

  const ordersQuery = useOrders();
  const biomarkersQuery = useBiomarkers({
    category: category?.category,
  });

  const biomarkers = biomarkersQuery.data?.biomarkers ?? [];

  const filteredBiomarkers = useFilteredBiomarkers({
    biomarkers: biomarkers,
    enabledFilters: { categories: false, date: true, range: true },
  });

  const [_, startTransition] = useTransition();

  const debouncedUpdate = useDebouncedCallback((q: string) => {
    startTransition(() => updateSearchQuery(q));
  }, 200);

  const isLoading =
    ordersQuery.isLoading ||
    biomarkersQuery.isLoading ||
    ordersQuery.isFetching ||
    biomarkersQuery.isFetching;

  return (
    <div>
      <div className="space-y-3">
        <div
          className={cn(
            'sticky md:top-20 top-4 z-10 bg-gradient-to-b from-zinc-50 to-transparent transition-all duration-500',
          )}
        >
          <div
            className={cn(
              'transition-all mx-auto flex-1 overflow-y-auto rounded-3xl bg-white border border-zinc-100 shadow-md shadow-black/[.02] scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300',
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
        {category?.category === SuperpowerCategory.GUT_HEALTH ? (
          <GutInsights />
        ) : null}
        {category?.category === SuperpowerCategory.TOXIN_EXPOSURE ? (
          <ToxinsInsights />
        ) : null}
      </div>

      <div className="mx-auto min-h-screen">
        <BiomarkersDataTable
          biomarkers={filteredBiomarkers}
          isLoading={isLoading}
          displayPending={true}
        />
      </div>
    </div>
  );
};

// TODO: check if AIAP already exists for any of this services
const GutInsights = () => {
  const navigate = useNavigate();

  const getServiceQuery = useService({
    serviceId: GUT_MICROBIOME_ANALYSIS_ID,
    method: 'IN_LAB',
  });

  const service = getServiceQuery.data?.service;

  if (getServiceQuery.isLoading) {
    return <Skeleton className="h-[106px] w-full rounded-[20px]" />;
  }

  if (!service) {
    return null;
  }

  return (
    <SelectableCard
      title={service.name}
      imageSrc={getServiceImage(service.name)}
      description={service.description}
      onToggle={() => navigate(`/services/${service.id}`)}
      trigger={
        <Button size="small" variant="outline">
          Unlock
        </Button>
      }
    />
  );
};

const ToxinsInsights = () => {
  const navigate = useNavigate();

  const getServicesQuery = useServices();
  const getOrdersQuery = useOrders();

  const services = getServicesQuery.data?.services;
  const requestGroups = getOrdersQuery.data?.requestGroups;

  const allOrders = requestGroups?.flatMap((rg) => rg.orders) ?? [];

  const hasCompletedOrder = (serviceId: string) =>
    allOrders.some(
      (o) => o.serviceId === serviceId && o.status === OrderStatus.completed,
    );

  if (getServicesQuery.isLoading) {
    return <Skeleton className="h-[106px] w-full rounded-[20px]" />;
  }

  if (!services) return null;

  const env = services.find((s) => s.id === ENVIRONMENTAL_TOXINS_TEST_ID);
  const mycotoxins = services.find((s) => s.id === MYCOTOXINS_TEST_ID);
  const heavymetals = services.find((s) => s.id === HEAVY_METALS_TEST_ID);

  return (
    <div className="space-y-2">
      {env && !hasCompletedOrder(ENVIRONMENTAL_TOXINS_TEST_ID) ? (
        <SelectableCard
          title={env.name}
          imageSrc={getServiceImage(env.name)}
          description={env.description}
          onToggle={() => navigate(`/services/${env.id}`)}
          trigger={
            <Button size="small" variant="outline">
              Unlock
            </Button>
          }
        />
      ) : null}
      {mycotoxins && !hasCompletedOrder(MYCOTOXINS_TEST_ID) ? (
        <SelectableCard
          title={mycotoxins.name}
          imageSrc={getServiceImage(mycotoxins.name)}
          description={mycotoxins.description}
          onToggle={() => navigate(`/services/${mycotoxins.id}`)}
          trigger={
            <Button size="small" variant="outline">
              Unlock
            </Button>
          }
        />
      ) : null}
      {heavymetals && !hasCompletedOrder(HEAVY_METALS_TEST_ID) ? (
        <SelectableCard
          title={heavymetals.name}
          imageSrc={getServiceImage(heavymetals.name)}
          description={heavymetals.description}
          onToggle={() => navigate(`/services/${heavymetals.id}`)}
          trigger={
            <Button size="small" variant="outline">
              Unlock
            </Button>
          }
        />
      ) : null}
    </div>
  );
};
