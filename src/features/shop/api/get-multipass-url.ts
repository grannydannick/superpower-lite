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
  });
};

type UseGetMultipassUrlOptions = {
  queryConfig?: QueryConfig<typeof getMultipassUrlQueryOptions>;
};

export const useGetMultipassUrl = ({
  queryConfig,
}: UseGetMultipassUrlOptions = {}) => {
  return useQuery({
    ...getMultipassUrlQueryOptions(),
    ...queryConfig,
  });
};
