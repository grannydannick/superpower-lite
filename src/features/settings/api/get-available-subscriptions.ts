import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { AvailableSubscription } from '@/types/api';

export const getAvailableSubscriptions = (
  coupon?: string,
): Promise<AvailableSubscription[]> => {
  return api.get(
    `billing/subscription/available${coupon ? `?code=${coupon}` : ''}`,
  );
};

export const availableSubscriptionsQueryOptions = (code?: string) => {
  return queryOptions({
    // we dont need cache key here because its highly dynamic
    queryKey: ['availableSubscriptions', code],
    queryFn: () => getAvailableSubscriptions(code),
  });
};

type UseAvailableSubscriptionsOptions = {
  code?: string;
  queryConfig?: QueryConfig<typeof availableSubscriptionsQueryOptions>;
};

/*
 * Returns price for superpower base membership
 * */
export const useAvailableSubscriptions = ({
  queryConfig,
  code,
}: UseAvailableSubscriptionsOptions = {}) => {
  return useQuery({
    ...availableSubscriptionsQueryOptions(code),
    ...queryConfig,
  });
};
