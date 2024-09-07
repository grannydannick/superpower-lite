import { QueryClient } from '@tanstack/react-query';
import { Database } from 'lucide-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Body1, H1 } from '@/components/ui/typography';
import { getBiomarkersQueryOptions } from '@/features/biomarkers/api';
import { BiologicalAgeCard } from '@/features/biomarkers/components/biological-age-card';
import { BiomarkersDataTable } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-data-table';
import { BiomarkersSummaryCard } from '@/features/biomarkers/components/biomarkers-summary-card';

export const dataLoader = (queryClient: QueryClient) => async () => {
  const query = getBiomarkersQueryOptions();

  return (
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  );
};

export const DataRoute = () => {
  const navigate = useNavigate();

  return (
    <ContentLayout bgColor="zinc">
      <div className="flex items-center justify-between">
        <H1>Data</H1>
        <Button
          variant="outline"
          className="gap-2.5 bg-white px-4 py-[18px]"
          onClick={() => navigate('/app/vault')}
        >
          <Database className="size-[14px] text-zinc-400" />
          <Body1 className="text-zinc-500">Health records</Body1>
        </Button>
      </div>
      <section
        id="summary"
        className="flex flex-col gap-5 pt-6 lg:flex-row lg:pb-16"
      >
        <BiologicalAgeCard />
        <BiomarkersSummaryCard />
      </section>
      <section id="data">
        <BiomarkersDataTable />
      </section>
    </ContentLayout>
  );
};
