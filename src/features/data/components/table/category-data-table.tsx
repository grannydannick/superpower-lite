import { useEffect, useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ENVIRONMENTAL_TOXINS,
  GUT_MICROBIOME_ANALYSIS_ID,
  HEAVY_METALS_TEST,
  MYCOTOXINS_TEST,
} from '@/const';
import { useOrders } from '@/features/orders/api';
import { useService, useServices } from '@/features/services/api';
import { ServiceActionCard } from '@/features/services/components/service-action-card';
import { cn } from '@/lib/utils';
import { Category, SuperpowerCategory } from '@/types/api';

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

  const {
    data: orders,
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
  } = useOrders();
  const {
    data: biomarkers,
    isLoading: isBiomarkersLoading,
    isFetching: isBiomarkersFetching,
  } = useBiomarkers({
    category: category?.category,
  });

  const filteredBiomarkers = useFilteredBiomarkers({
    biomarkers: biomarkers?.biomarkers,
    orders: orders?.orders,
    enabledFilters: { categories: false, date: true, range: true },
  });

  const [_, startTransition] = useTransition();

  const debouncedUpdate = useDebouncedCallback((q: string) => {
    startTransition(() => updateSearchQuery(q));
  }, 200);

  const isLoading =
    isOrdersLoading ||
    isBiomarkersLoading ||
    isOrdersFetching ||
    isBiomarkersFetching;

  return (
    <div>
      <div className="space-y-3 ">
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
    <ServiceActionCard
      displayPrice={false}
      service={service}
      toggle={() => navigate(`/services/${service.id}`)}
      trigger={
        <Button size="small" variant="outline">
          Unlock
        </Button>
      }
    />
  );
};

// TODO: check if AIAP already exists for any of this services
const ToxinsInsights = () => {
  const navigate = useNavigate();

  const getServicesQuery = useServices();

  const services = getServicesQuery.data?.services;

  if (getServicesQuery.isLoading) {
    return <Skeleton className="h-[106px] w-full rounded-[20px]" />;
  }

  if (!services) return null;

  const env = services.find((s) => s.name === ENVIRONMENTAL_TOXINS);
  const mycotoxins = services.find((s) => s.name === MYCOTOXINS_TEST);
  const heavymetals = services.find((s) => s.name === HEAVY_METALS_TEST);

  return (
    <div className="space-y-2">
      {env ? (
        <ServiceActionCard
          displayPrice={false}
          service={env}
          toggle={() => navigate(`/services/${env.id}`)}
          trigger={
            <Button size="small" variant="outline">
              Unlock
            </Button>
          }
        />
      ) : null}
      {mycotoxins ? (
        <ServiceActionCard
          displayPrice={false}
          service={mycotoxins}
          toggle={() => navigate(`/services/${mycotoxins.id}`)}
          trigger={
            <Button size="small" variant="outline">
              Unlock
            </Button>
          }
        />
      ) : null}
      {heavymetals ? (
        <ServiceActionCard
          displayPrice={false}
          service={heavymetals}
          toggle={() => navigate(`/services/${heavymetals.id}`)}
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
