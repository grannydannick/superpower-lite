import { CarePlan as FhirCarePlan } from '@medplum/fhirtypes';

import { MainErrorFallback } from '@/components/errors/main';
import { Spinner } from '@/components/ui/spinner';
import { useBiomarkers } from '@/features/biomarkers/api/get-biomarkers';
import { usePlan } from '@/features/plans/api/get-plan';
import { PlanHealthScore } from '@/features/plans/components/annual-report/plan-health-score';
import { RecommendedItems } from '@/features/plans/components/consultation/recommended-items';
import { PlanGoals } from '@/features/plans/components/goals/plan-goals';
import { PlanOverview } from '@/features/plans/components/plan-overview';
import { PlanTopper } from '@/features/plans/components/plan-topper';
import { useProducts } from '@/features/shop/api';

import { CarePlanProvider, useCarePlan } from '../context/care-plan-context';

import { PlanActivities } from './activities/plan-activities';
import { CarePlanFooter } from './plan-footer';
import { CarePlanHeader } from './plan-header';

function CarePlanContent() {
  const { isAnnualReport } = useCarePlan();

  return (
    <div className="mx-auto w-full max-w-screen-md space-y-4 px-4 pb-16">
      <PlanTopper />
      <PlanOverview />
      {isAnnualReport ? <PlanHealthScore /> : null}
      <PlanGoals />
      <PlanActivities />
      <RecommendedItems />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="lg" variant="primary" />
    </div>
  );
}

const isAnnualReportPlan = (plan: FhirCarePlan) => {
  return (
    plan.extension?.find(
      (e) =>
        e.url ===
        'https://superpower.com/fhir/StructureDefinition/care-plan-type',
    )?.valueString === 'annual'
  );
};

export function CarePlan({ id }: { id: string }) {
  const getPlansQuery = usePlan({ id });
  // preload products and biomarkers for cache
  const getProductsQuery = useProducts({});
  const getBiomarkersQuery = useBiomarkers();

  const isLoading =
    getPlansQuery.isLoading ||
    getProductsQuery.isLoading ||
    getBiomarkersQuery.isLoading;

  const hasError =
    getPlansQuery.isError ||
    getProductsQuery.isError ||
    getBiomarkersQuery.isError;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError) {
    return <MainErrorFallback />;
  }

  if (!getPlansQuery.data) {
    return null;
  }

  const { actionPlan } = getPlansQuery.data;
  const isAnnualReport = isAnnualReportPlan(actionPlan);

  return (
    <div className="min-h-screen w-full space-y-4 bg-zinc-50">
      <CarePlanProvider plan={actionPlan} isAnnualReport={isAnnualReport}>
        <CarePlanHeader />
        <CarePlanContent />
        <CarePlanFooter />
      </CarePlanProvider>
    </div>
  );
}
