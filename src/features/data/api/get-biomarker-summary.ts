import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type BiomarkerSummary = {
  category: string;
  summary: string;
  lastUpdatedAt: Date;
  generatedAt: Date;
};

/**
 * Maps frontend category names to backend API slugs.
 * Backend expects specific slugs like 'heart_and_vascular', not 'heart_&_vascular_health'.
 */
const CATEGORY_TO_API_SLUG: Record<string, string> = {
  'heart & vascular health': 'heart_and_vascular',
  'liver health': 'liver',
  'kidney health': 'kidney',
  'metabolic health': 'metabolic',
  inflammation: 'inflammation',
  nutrients: 'nutrients',
  energy: 'energy',
  'immune system': 'immune_system',
  'dna health': 'dna_health',
  'brain health': 'brain_health',
  'thyroid health': 'thyroid_health',
  'sex hormones': 'sex_hormones',
  'gut health': 'gut_health',
  gut: 'gut_health',
  'toxin exposure': 'toxin_exposure',
  toxic: 'toxin_exposure',
  'skin & hair': 'skin_and_hair',
  skin: 'skin_and_hair',
  sleep: 'sleep',
  'body composition': 'body_composition',
  'body health': 'body_composition',
  wearables: 'wearables',
};

const normalizeCategoryToSlug = (category: string): string => {
  const lowerCategory = category.toLowerCase();

  // Check explicit mapping first
  if (CATEGORY_TO_API_SLUG[lowerCategory]) {
    return CATEGORY_TO_API_SLUG[lowerCategory];
  }

  // Fallback: normalize by replacing & with 'and', spaces with underscores
  return lowerCategory
    .replaceAll('&', 'and')
    .replaceAll(' ', '_')
    .replace(/_health$/, ''); // Remove trailing _health if present
};

export const getBiomarkerSummary = async ({
  category,
}: {
  category: string;
}): Promise<BiomarkerSummary> => {
  const normalizedCategory = normalizeCategoryToSlug(category);

  // suppress global error toasts for this request specifically.
  return await api.get(`/chat/biomarkers/summary/${normalizedCategory}`, {
    headers: { 'x-hide-toast': 'true' },
  });
};

export const getBiomarkerSummaryQueryOptions = (category: string) => {
  return queryOptions({
    queryKey: ['biomarker-summary', category],
    queryFn: () => getBiomarkerSummary({ category }),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

type UseBiomarkerSummaryOptions = {
  queryConfig?: QueryConfig<typeof getBiomarkerSummaryQueryOptions>;
  category: string;
};

export const useBiomarkerSummary = ({
  queryConfig,
  category,
}: UseBiomarkerSummaryOptions) => {
  return useQuery({
    ...getBiomarkerSummaryQueryOptions(category),
    ...queryConfig,
  });
};
