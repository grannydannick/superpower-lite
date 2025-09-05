import { CarePlan as FhirCarePlan } from '@medplum/fhirtypes';

import { MainErrorFallback } from '@/components/errors/main';
import { Spinner } from '@/components/ui/spinner';
import { useBiomarkers } from '@/features/biomarkers/api/get-biomarkers';
import { usePlan } from '@/features/plans/api/get-plan';
import { useProducts } from '@/features/shop/api';

import { CarePlanProvider } from '../context/care-plan-context';

import { CarePlanContent } from './care-plan-content';
import { CarePlanSidebar } from './care-plan-sidebar';
import { FloatingMenu } from './navigation/floating-menu';

function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="md" variant="primary" />
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
    <div className="mt-6 w-full bg-zinc-50">
      <CarePlanProvider plan={actionPlan} isAnnualReport={isAnnualReport}>
        <div className="relative mx-auto flex size-full h-full max-w-6xl flex-col px-6 lg:flex-row lg:gap-20 lg:px-0">
          <CarePlanSidebar />
          <div className="flex flex-1 flex-col pt-10">
            <CarePlanContent />
          </div>
          <div className="hidden w-full max-w-48 shrink-0 lg:block" />
        </div>
        <FloatingMenu />
      </CarePlanProvider>
    </div>
  );
}
