import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Subscription } from '@/types/api';

export const getSubscriptions = (
  page = 1,
): Promise<{ subscriptions: Subscription[] }> => {
  return api.get(`/billing/subscriptions`, {
    params: {
      page,
    },
  });
};

export const getSubscriptionsQueryOptions = ({
  page,
}: { page?: number } = {}) => {
  return queryOptions({
    queryKey: page ? ['subscriptions', { page }] : ['subscriptions'],
    queryFn: () => getSubscriptions(page),
  });
};

type useSubscriptionsOptions = {
  page?: number;
  queryConfig?: QueryConfig<typeof getSubscriptionsQueryOptions>;
};

export const useSubscriptions = ({
  queryConfig,
  page,
}: useSubscriptionsOptions = {}) => {
  return useQuery({
    ...getSubscriptionsQueryOptions({ page }),
    ...queryConfig,
  });
};
