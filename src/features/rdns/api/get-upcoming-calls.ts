import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { OrderWithUserInfo } from '@/types/api';

export const getUpcomingCalls = (): Promise<{
  orders: OrderWithUserInfo[];
}> => {
  return api.get('/rdns/patients/services');
};

export const getUpcomingCallsQueryOptions = () => {
  return queryOptions({
    queryKey: ['upcoming-calls'],
    queryFn: () => getUpcomingCalls(),
  });
};

type UseGetUpcomingCallsOptions = {
  queryConfig?: QueryConfig<typeof getUpcomingCallsQueryOptions>;
};

export const useGetUpcomingCalls = ({
  queryConfig,
}: UseGetUpcomingCallsOptions = {}) => {
  return useQuery({
    ...getUpcomingCallsQueryOptions(),
    ...queryConfig,
  });
};
