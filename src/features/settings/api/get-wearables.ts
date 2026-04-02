import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Wearable } from '@/types/api';

export const getWearables = (): Promise<{ wearables: Wearable[] }> => {
  return api.get('/wearables', {
    headers: { 'x-hide-toast': 'true' },
  });
};

export const getWearablesQueryOptions = () => {
  return queryOptions({
    queryKey: ['wearables'],
    queryFn: () => getWearables(),
  });
};

type useWearablesOptions = {
  queryConfig?: QueryConfig<typeof getWearablesQueryOptions>;
};

export const useWearables = ({ queryConfig }: useWearablesOptions = {}) => {
  return useQuery({
    ...getWearablesQueryOptions(),
    ...queryConfig,
  });
};
