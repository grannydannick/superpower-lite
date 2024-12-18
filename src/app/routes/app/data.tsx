import { Database } from 'lucide-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Body1, H1 } from '@/components/ui/typography';
import { BiomarkersDataTable } from '@/features/biomarkers/components/biomarkers-data-table/biomarker-data-table';
import { DataCards } from '@/features/biomarkers/components/data-cards';

export const DataRoute = () => {
  const navigate = useNavigate();

  return (
    <ContentLayout title="Data">
      <div className="flex items-center justify-between">
        <H1>Data</H1>
        <Button
          variant="outline"
          className="gap-2.5 bg-white px-4 py-[18px]"
          onClick={() => navigate('/vault')}
        >
          <Database className="size-[14px] text-zinc-400" />
          <Body1 className="text-zinc-500">Health Records</Body1>
        </Button>
      </div>
      <DataCards />
      <section id="data">
        <BiomarkersDataTable />
      </section>
    </ContentLayout>
  );
};
