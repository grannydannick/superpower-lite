import { useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { H2, Body1 } from '@/components/ui/typography';
import { CategoriesTable } from '@/features/protocol/components/categories-table';
import { ProtocolStepLayout } from '@/features/protocol/components/layouts/protocol-step-layout';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';

export const HealthWinnersBiomarkersStep = () => {
  const { next, healthWinners, getCategoryBiomarkers, biomarkers } =
    useProtocolStepperContext();

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  // Only include quantity biomarkers that have values
  const quantityBiomarkers = useMemo(() => {
    return biomarkers.filter((b) => b.value?.[0]?.quantity);
  }, [biomarkers]);

  // Build CategoryGroup[] for CategoriesTable
  // Filter out out-of-range biomarkers since this is the health winners view
  const categoryGroups = useMemo(() => {
    return healthWinners.map((category) => ({
      category: category.category,
      value: category.value,
      biomarkers: getCategoryBiomarkers(category.category)
        .filter(
          (b) =>
            b.value?.[0]?.quantity && b.status !== 'HIGH' && b.status !== 'LOW',
        )
        .sort((a, b) =>
          a.status === 'OPTIMAL' && b.status !== 'OPTIMAL'
            ? -1
            : a.status !== 'OPTIMAL' && b.status === 'OPTIMAL'
              ? 1
              : 0,
        ),
    }));
  }, [healthWinners, getCategoryBiomarkers]);

  // Count optimal biomarkers across ALL biomarkers (not just winning categories)
  const optimalBiomarkerCount = useMemo(() => {
    return quantityBiomarkers.filter((b) => b.status === 'OPTIMAL').length;
  }, [quantityBiomarkers]);

  const totalBiomarkerCount = quantityBiomarkers.length;

  return (
    <ProtocolStepLayout>
      <div>
        <H2 className="mb-1 text-left">Your health winners</H2>
        <Body1 className="text-secondary">
          {`${optimalBiomarkerCount} out of ${totalBiomarkerCount} biomarkers are optimal`}
        </Body1>
      </div>
      <CategoriesTable categories={categoryGroups} maxVisibleBiomarkers={3} />
      <Button className="w-full" onClick={handleNext}>
        Continue
      </Button>
    </ProtocolStepLayout>
  );
};
