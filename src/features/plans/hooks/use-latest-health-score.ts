import { useMemo } from 'react';

import { HEALTH_OPTIMIZATION } from '@/const/health-score';
import { useBiomarkers } from '@/features/biomarkers/api';
import { mostRecent } from '@/features/biomarkers/utils/most-recent-biomarker';
import { Biomarker, BiomarkerComponent, BiomarkerResult } from '@/types/api';

interface UseLatestHealthScoreReturn {
  healthScore: Biomarker | undefined;
  latestScore: BiomarkerResult | null;
  healthGrades: BiomarkerComponent[];
  isLoading: boolean;
  error: unknown;
}

/**
 * Hook to get the latest health score and related health grade components
 *
 * This hook fetches biomarker data and extracts the most recent health score,
 * along with health optimization grade components. It's useful for displaying
 * health overview information in reports and dashboards.
 *
 * @returns Object containing:
 *   - healthScore: The health score biomarker data
 *   - latestScore: The most recent health score result
 *   - healthGrades: Array of health optimization grade components
 *   - isLoading: Loading state of the biomarkers query
 *   - error: Error state of the biomarkers query
 */
export const useLatestHealthScore = (): UseLatestHealthScoreReturn => {
  const getBiomarkersQuery = useBiomarkers();

  const healthScore = getBiomarkersQuery.data?.biomarkers.find(
    (b) => b.name === 'Health Score',
  );

  const latestScore = useMemo(
    () => (healthScore ? mostRecent(healthScore.value) ?? null : null),
    [healthScore],
  );

  const healthGrades = useMemo(
    () =>
      latestScore?.component.filter(
        (c) => c.category === HEALTH_OPTIMIZATION,
      ) ?? [],
    [latestScore?.component],
  );

  return {
    healthScore,
    latestScore,
    healthGrades,
    isLoading: getBiomarkersQuery.isLoading,
    error: getBiomarkersQuery.error,
  };
};
