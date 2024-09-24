import { Spinner } from '@/components/ui/spinner';
import { usePlans } from '@/features/action-plan/api/get-plans';
import { ActionPlanComponent } from '@/features/action-plan/components/action-plan';
import { AnnualReportComponent } from '@/features/action-plan/components/annual-report';
import { BiomarkerDataView } from '@/features/action-plan/components/biomarker-data-view';
import { ClinicianNoteHeader } from '@/features/action-plan/components/note-header';
import { PlanStoreProvider } from '@/features/action-plan/stores/plan-store';
import { useUser } from '@/lib/auth';

interface ClinicianNoteProps {
  orderId: string | undefined;
}

export const ClinicianNote = ({ orderId }: ClinicianNoteProps) => {
  const { data: user } = useUser();
  const getPlansQuery = usePlans({});

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
    <PlanStoreProvider
      initialPlan={specificPlan}
      isAdmin={Boolean(user?.adminActor)}
    >
      <ClinicianNoteLayout />
    </PlanStoreProvider>
  );
};

const ClinicianNoteLayout = () => {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F7F7F7] bg-dot-zinc-400/[0.4]">
      <ClinicianNoteHeader />
      <div className="flex w-full items-start justify-center gap-8 p-6">
        <BiomarkerDataView />
        <AnnualReportComponent />
        <ActionPlanComponent />
      </div>
    </div>
  );
};
