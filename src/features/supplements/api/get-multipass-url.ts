import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export const getMultipassUrl = (
  returnTo?: string,
): Promise<{ url: string }> => {
  const params = returnTo !== undefined ? { returnTo } : {};
  return api.get('/shop/multipass-url', { params });
};

export const getMultipassUrlQueryOptions = (returnTo?: string) => {
  return queryOptions({
    queryKey: ['shop', 'multipass-url', returnTo],
    queryFn: () => getMultipassUrl(returnTo),
    staleTime: 0,
    gcTime: 0,
  });
};

type UseGetMultipassUrlOptions = {
  returnTo?: string;
  queryConfig?: QueryConfig<typeof getMultipassUrlQueryOptions>;
};

export const useGetMultipassUrl = ({
  returnTo,
  queryConfig = {
    refetchOnWindowFocus: false,
  },
}: UseGetMultipassUrlOptions = {}) => {
  return useQuery({
    ...getMultipassUrlQueryOptions(returnTo),
    ...queryConfig,
  });
};
