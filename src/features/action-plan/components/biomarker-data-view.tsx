import { Skeleton } from '@/components/ui/skeleton';
import { usePlan } from '@/features/action-plan/stores/plan-store';
import { useBiomarkers } from '@/features/biomarkers/api/get-biomarkers';
import { useUser } from '@/lib/auth';

import { ActionPlanDataView } from './data-view';

export const BiomarkerDataView = () => {
  const biomarkersQuery = useBiomarkers();
  const { data: user } = useUser();
  const isAdmin = usePlan((s) => s.isAdmin);

  if (!isAdmin) {
    return null;
  }

  if (biomarkersQuery.isLoading) {
    return (
      <Skeleton className=" hidden h-[664px] w-[728px] rounded-3xl lg:block" />
    );
  }

  if (!biomarkersQuery.data || !user) return <></>;

  const patientName = `${user.firstName} ${user.lastName}`;

  return (
    <ActionPlanDataView
      patientName={patientName}
      biomarkers={biomarkersQuery.data.biomarkers}
    />
  );
};
