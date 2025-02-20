import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { AvailableSubscription } from '@/types/api';
import { getAccessCode } from '@/utils/access-code';

export const getAvailableSubscriptions = (): Promise<
  AvailableSubscription[]
> => {
  // get current value in local storage
  const coupon = getAccessCode();
  return api.get(
    `billing/subscription/available${coupon ? `?code=${coupon}` : ''}`,
  );
};

export const availableSubscriptionsQueryOptions = () => {
  return queryOptions({
    // we dont need cache key here because its highly dynamic
    queryKey: ['availableSubscriptions'],
    queryFn: () => getAvailableSubscriptions(),
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
}: UseAvailableSubscriptionsOptions = {}) => {
  return useQuery({
    ...availableSubscriptionsQueryOptions(),
    ...queryConfig,
  });
};
