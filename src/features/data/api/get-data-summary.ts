import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { api } from '@/orpc/client';

const CATEGORY_ORDER = [
  'heart-vascular-health',
  'metabolic-health',
  'sex-hormones',
  'thyroid-health',
  'inflammation',
  'liver-health',
  'kidney-health',
  'nutrients',
  'energy',
  'immune-system',
  'dna-health',
  'brain-health',
  'gut-health',
  'toxin-exposure',
  'body-composition',
];

const sortCategories = <T extends { slug: string }>(categories: T[]): T[] => {
  return [...categories].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug);
    const bi = CATEGORY_ORDER.indexOf(b.slug);
    const aOrder = ai === -1 ? CATEGORY_ORDER.length : ai;
    const bOrder = bi === -1 ? CATEGORY_ORDER.length : bi;
    return aOrder - bOrder;
  });
};

export const dataSummaryQueryOptions = () =>
  queryOptions({
    queryKey: ['data', 'summary'],
    queryFn: async () => {
      const { data, error } = await api.GET('/data/summary');
      if (error) throw error;
      return data;
    },
    select: (data) => ({
      ...data,
      categories: sortCategories(data.categories),
    }),
  });

export const useDataSummary = () => useQuery(dataSummaryQueryOptions());

export const useDataSummarySuspense = () =>
  useSuspenseQuery(dataSummaryQueryOptions());
