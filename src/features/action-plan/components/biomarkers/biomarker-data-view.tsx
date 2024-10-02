import { Skeleton } from '@/components/ui/skeleton';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useBiomarkers } from '@/features/biomarkers/api/get-biomarkers';

import { columns } from './columns';
import { DataTable } from './data-table';

export const BiomarkerDataView = () => {
  const biomarkersQuery = useBiomarkers();
  const isAdmin = usePlan((s) => s.isAdmin);

  if (!isAdmin) {
    return null;
  }

  if (biomarkersQuery.isLoading) {
    return (
      <Skeleton className=" hidden h-[664px] w-[728px] rounded-3xl lg:block" />
    );
  }

  if (!biomarkersQuery.data) return <></>;

  return <DataTable data={biomarkersQuery.data.biomarkers} columns={columns} />;
};
