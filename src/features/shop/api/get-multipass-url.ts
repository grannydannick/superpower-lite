import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export const getMultipassUrl = (): Promise<{ url: string }> => {
  return api.get('/shop/multipass-url');
};

export const getMultipassUrlQueryOptions = () => {
  return queryOptions({
    queryKey: ['shop', 'multipass-url'],
    queryFn: () => getMultipassUrl(),
    staleTime: 0,
    gcTime: 0,
  });
};

type UseGetMultipassUrlOptions = {
  queryConfig?: QueryConfig<typeof getMultipassUrlQueryOptions>;
};

export const useGetMultipassUrl = (
  { queryConfig }: UseGetMultipassUrlOptions = {
    queryConfig: {
      refetchOnWindowFocus: false,
    },
  },
) => {
  return useQuery({
    ...getMultipassUrlQueryOptions(),
    ...queryConfig,
  });
};
