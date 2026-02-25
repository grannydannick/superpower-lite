import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { QueryConfig } from '@/lib/react-query';
import { RxSubscription } from '@/types/api';

export const getSubscriptions = (
  id?: string,
): Promise<{ data: RxSubscription[] }> => {
  return api.get(`/rx/patient/${id}/subscriptions`);
};

export const getSubscriptionsQueryOptions = (id?: string) => {
  return queryOptions({
    queryKey: ['rx-subscriptions'],
    queryFn: () => getSubscriptions(id),
  });
};

type UseSubscriptionsOptions = {
  queryConfig?: QueryConfig<typeof getSubscriptionsQueryOptions>;
};

export const useSubscriptions = ({
  queryConfig,
}: UseSubscriptionsOptions = {}) => {
  const { data: user } = useUser();

  const id = user?.id;

  return useQuery({
    ...getSubscriptionsQueryOptions(id),
    ...queryConfig,
  });
};
