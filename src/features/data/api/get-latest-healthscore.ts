import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/orpc/client';

import type { DataBiomarker } from '../types/data-api';
import { getLatestObservationValue } from '../utils/get-latest-observation-value';

const HEALTH_SCORE_SLUG = 'health-score';

const selectLatestHealthScore = (data: {
  biomarkers: { slug: string; observation?: unknown }[];
}) => {
  const biomarkers = data.biomarkers as DataBiomarker[];
  const observation = biomarkers.find(
    (b) => b.slug === HEALTH_SCORE_SLUG,
  )?.observation;
  return { healthScore: getLatestObservationValue(observation) ?? null };
};

export const getLatestHealthScoreQueryOptions = () =>
  queryOptions({
    queryKey: ['data', 'biomarkers'],
    queryFn: async () => {
      const { data, error } = await api.GET('/data/biomarkers', {
        params: { query: {} },
      });
      if (error) throw error;
      return data;
    },
    select: selectLatestHealthScore,
  });

export const useLatestHealthScore = () =>
  useQuery(getLatestHealthScoreQueryOptions());
