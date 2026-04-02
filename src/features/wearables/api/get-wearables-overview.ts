import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type WearablesOverview = {
  generatedAt: string;
  providerFilter: string | null;
  providers: Array<{
    provider: string;
    name: string;
    status: string;
    integrationCategory?: string;
    updateModel?: string;
    historicalDefaultDays?: number | null;
    supportedResources: string[];
    devices?: Array<{
      sourceType: string;
      deviceManufacturer: string;
      deviceModel: string;
    }>;
  }>;
  latest: Record<string, unknown>;
  interpretationGuidance: string[];
  errors: Array<{ resource: string; name: string; message: string }>;
};

/**
 * Normalize the `latest` map from the API:
 * - Values may be arrays (new format) — take the first item
 * - `workout` key → `workouts` to match metric resource names
 */
function normalizeLatest(
  latest: Record<string, unknown>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(latest)) {
    const normalizedKey = key === 'workout' ? 'workouts' : key;
    normalized[normalizedKey] = Array.isArray(value)
      ? (value[0] ?? null)
      : value;
  }
  return normalized;
}

export const getWearablesOverview = async (): Promise<{
  overview: WearablesOverview;
}> => {
  const result: { overview: WearablesOverview } = await api.get(
    '/chat/wearables/overview',
  );
  if (result.overview?.latest) {
    result.overview.latest = normalizeLatest(result.overview.latest);
  }
  return result;
};

export const getWearablesOverviewQueryOptions = () => {
  return queryOptions({
    queryKey: ['wearables-overview'],
    queryFn: () => getWearablesOverview(),
  });
};

type UseWearablesOverviewOptions = {
  queryConfig?: QueryConfig<typeof getWearablesOverviewQueryOptions>;
};

export const useWearablesOverview = ({
  queryConfig,
}: UseWearablesOverviewOptions = {}) => {
  return useQuery({
    ...getWearablesOverviewQueryOptions(),
    ...queryConfig,
  });
};
