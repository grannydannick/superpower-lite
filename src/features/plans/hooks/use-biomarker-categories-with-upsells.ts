import { useMemo } from 'react';

import { ENVIRONMENTAL_TOXINS, NUTRITION_AND_GUT } from '@/const/health-score';
import {
  ENVIRONMENTAL_TOXINS as ENVIRONMENTAL_TOXINS_SERVICE,
  GUT_MICROBIOME_ANALYSIS as NUTRITION_AND_GUT_SERVICE,
} from '@/const/services';
import { useServices } from '@/features/services/api';
import { BiomarkerComponent, HealthcareService } from '@/types/api';

interface ProcessedBiomarkerCategory {
  components: BiomarkerComponent[];
  validBiomarkers: BiomarkerComponent[];
  hasNulls: boolean;
}

interface UseBiomarkerCategoriesWithUpsellsReturn {
  environmentalBiomarkers: ProcessedBiomarkerCategory;
  nutritionBiomarkers: ProcessedBiomarkerCategory;
  environmentalService: HealthcareService | undefined;
  nutritionService: HealthcareService | undefined;
  isLoading: boolean;
  error: unknown;
}

/**
 * Hook to process biomarker categories and find corresponding upsell services
 *
 * This hook analyzes biomarker data to identify categories with missing data
 * and finds corresponding healthcare services that can be offered as upsells.
 * It's useful for displaying service recommendations based on incomplete
 * biomarker profiles.
 *
 * @param biomarkers - Array of biomarker components
 * @returns Object containing:
 *   - environmentalBiomarkers: Processed environmental toxins biomarker data
 *   - nutritionBiomarkers: Processed nutrition & gut biomarker data
 *   - environmentalService: Environmental toxins service if upsell is recommended (missing data)
 *   - nutritionService: Nutrition & gut service if upsell is recommended (missing data)
 *   - isLoading: Loading state of the services query
 *   - error: Error state of the services query
 */
export const useBiomarkerCategoriesWithUpsells = (
  biomarkers: BiomarkerComponent[],
): UseBiomarkerCategoriesWithUpsellsReturn => {
  const { data: servicesData, isLoading, error } = useServices();

  const processBiomarkerCategory = useMemo(
    () =>
      (category: string): ProcessedBiomarkerCategory => {
        const components =
          biomarkers.filter((c) => c.category === category) ?? [];
        const validBiomarkers = components.filter((c) => c.value !== '-');
        const hasNulls = components.length !== validBiomarkers.length;
        return {
          components,
          validBiomarkers,
          hasNulls,
        };
      },
    [biomarkers],
  );

  const environmentalBiomarkers = useMemo(
    () => processBiomarkerCategory(ENVIRONMENTAL_TOXINS),
    [processBiomarkerCategory],
  );

  const nutritionBiomarkers = useMemo(
    () => processBiomarkerCategory(NUTRITION_AND_GUT),
    [processBiomarkerCategory],
  );

  const environmentalService = useMemo(
    () =>
      environmentalBiomarkers.hasNulls
        ? servicesData?.services?.find(
            (s) => s.name === ENVIRONMENTAL_TOXINS_SERVICE,
          )
        : undefined,
    [environmentalBiomarkers.hasNulls, servicesData?.services],
  );

  const nutritionService = useMemo(
    () =>
      nutritionBiomarkers.hasNulls
        ? servicesData?.services?.find(
            (s) => s.name === NUTRITION_AND_GUT_SERVICE,
          )
        : undefined,
    [nutritionBiomarkers.hasNulls, servicesData?.services],
  );

  return {
    environmentalBiomarkers,
    nutritionBiomarkers,
    environmentalService,
    nutritionService,
    isLoading,
    error,
  };
};
