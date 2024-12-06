import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { AvailableSubscription } from '@/types/api';

export const getAvailableSubscriptions = ({
  code,
}: {
  code?: string;
}): Promise<AvailableSubscription[]> => {
  return api.get(
    `billing/subscription/available${code ? `?code=${code}` : ''}`,
  );
};

export const availableSubscriptionsQueryOptions = (code?: string) => {
  return queryOptions({
    queryKey: ['availableSubscriptions', code],
    queryFn: () => getAvailableSubscriptions({ code }),
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
  code,
  queryConfig,
}: UseAvailableSubscriptionsOptions = {}) => {
  const coupon = localStorage.getItem('superpower-code') ?? undefined;

  return useQuery({
    ...availableSubscriptionsQueryOptions(code ? code : coupon),
    ...queryConfig,
  });
};
