import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export type WearablesSummary = {
  summary: string;
};

export const getWearablesSummary = (): Promise<WearablesSummary> => {
  return api.get('/chat/wearables/summary', {
    headers: { 'x-hide-toast': 'true' },
  });
};

export const getWearablesSummaryQueryOptions = () => {
  return queryOptions({
    queryKey: ['wearables-summary'],
    queryFn: () => getWearablesSummary(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

type UseWearablesSummaryOptions = {
  queryConfig?: QueryConfig<typeof getWearablesSummaryQueryOptions>;
};

export const useWearablesSummary = ({
  queryConfig,
}: UseWearablesSummaryOptions = {}) => {
  return useQuery({
    ...getWearablesSummaryQueryOptions(),
    ...queryConfig,
  });
};
