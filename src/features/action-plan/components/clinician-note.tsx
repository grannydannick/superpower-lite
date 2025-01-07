import { useShallow } from 'zustand/react/shallow';

import { Spinner } from '@/components/ui/spinner';
import { usePlans } from '@/features/action-plan/api/get-plans';
import { ActionPlanComponent } from '@/features/action-plan/components/action-plan';
import { AnnualReportComponent } from '@/features/action-plan/components/annual-report';
import { ClinicianTools } from '@/features/action-plan/components/clinician-tools';
import { ClinicianNoteHeader } from '@/features/action-plan/components/note-header';
import {
  PlanStoreProvider,
  usePlan,
} from '@/features/action-plan/stores/plan-store';
import { useCurrentPatient } from '@/features/rdns/hooks/use-current-patient';
import { cn } from '@/lib/utils';

interface ClinicianNoteProps {
  orderId: string | undefined;
}

export const ClinicianNote = ({ orderId }: ClinicianNoteProps) => {
  const getPlansQuery = usePlans({});
  const { hasAllowedRole } = useCurrentPatient();

  if (getPlansQuery.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (!getPlansQuery.data) return <></>;

  const specificPlan = getPlansQuery.data.actionPlans.find(
    (actionPlan) => actionPlan.orderId === orderId,
  );

  if (!specificPlan) return <></>;

  return (
    <PlanStoreProvider initialPlan={specificPlan} isAdmin={hasAllowedRole}>
      <ClinicianNoteLayout />
    </PlanStoreProvider>
  );
};

const ClinicianNoteLayout = () => {
  const { isAdmin } = usePlan(useShallow((s) => s));

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 bg-dot-zinc-400/[0.4]">
      <ClinicianNoteHeader />
      <div
        className={cn(
          'grid grid-cols-1 gap-8 p-6',
          !isAdmin ? '' : 'xl:grid-cols-2',
        )}
      >
        <ClinicianTools />
        <AnnualReportComponent />
        <ActionPlanComponent />
      </div>
    </div>
  );
};
