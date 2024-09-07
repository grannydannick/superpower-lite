import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { MultiPlatformOrder } from '@/types/api';

export const getMultiPlatformOrders = (): Promise<{
  multiPlatformOrders: MultiPlatformOrder[];
}> => {
  return api.get('/orders/all-platforms');
};

export const getMultiPlatformOrdersQueryOptions = () => {
  return queryOptions({
    queryKey: ['multiPlatformOrders'],
    queryFn: () => getMultiPlatformOrders(),
  });
};

type UseMultiPlatformOrdersOptions = {
  queryConfig?: QueryConfig<typeof getMultiPlatformOrdersQueryOptions>;
};

export const useMultiPlatformOrders = ({
  queryConfig,
}: UseMultiPlatformOrdersOptions = {}) => {
  return useQuery({
    ...getMultiPlatformOrdersQueryOptions(),
    ...queryConfig,
  });
};
