import { useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { H2, Body1 } from '@/components/ui/typography';
import { CategoriesTable } from '@/features/protocol/components/categories-table';
import { ProtocolStepLayout } from '@/features/protocol/components/layouts/protocol-step-layout';
import { useProtocolStepperContext } from '@/features/protocol/components/reveal/protocol-stepper-context';

export const AreasToImproveBiomarkersStep = () => {
  const { next, areasToImprove, getCategoryBiomarkers, biomarkers } =
    useProtocolStepperContext();

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  // Only include quantity biomarkers that have values
  const quantityBiomarkers = useMemo(() => {
    return biomarkers.filter((b) => b.value?.[0]?.quantity);
  }, [biomarkers]);

  // Build CategoryGroup[] for CategoriesTable
  // Assumes latest results are being shown
  const categoryGroups = useMemo(() => {
    return areasToImprove.map((category) => ({
      category: category.category,
      value: category.value,
      biomarkers: getCategoryBiomarkers(category.category).filter(
        (b) => b.value?.[0]?.quantity,
      ),
    }));
  }, [areasToImprove, getCategoryBiomarkers]);

  // Count out-of-range biomarkers (HIGH or LOW status) across ALL biomarkers
  const outOfRangeBiomarkerCount = useMemo(() => {
    return quantityBiomarkers.filter(
      (b) => b.status === 'HIGH' || b.status === 'LOW',
    ).length;
  }, [quantityBiomarkers]);

  const totalBiomarkerCount = quantityBiomarkers.length;

  return (
    <ProtocolStepLayout>
      <div>
        <H2 className="mb-1 text-left">Areas of improvement</H2>
        <Body1 className="text-secondary">
          {`${outOfRangeBiomarkerCount} out of ${totalBiomarkerCount} biomarkers are out of range`}
        </Body1>
      </div>
      <CategoriesTable categories={categoryGroups} maxVisibleBiomarkers={3} />
      <Button className="w-full" onClick={handleNext}>
        Continue
      </Button>
    </ProtocolStepLayout>
  );
};
