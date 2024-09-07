import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { SubscriptionPrice } from '@/types/api';

export const membershipPrice = ({
  code,
}: {
  code?: string;
}): Promise<SubscriptionPrice> => {
  return api.get(`billing/subscription/price${code ? `?code=${code}` : ''}`);
};

export const membershipPriceQueryOptions = (code?: string) => {
  return queryOptions({
    queryKey: ['subscriptionPrice', code],
    queryFn: () => membershipPrice({ code }),
  });
};

type UseMembershipPriceOptions = {
  code?: string;
  queryConfig?: QueryConfig<typeof membershipPriceQueryOptions>;
};

/*
 * Returns price for superpower base membership
 * */
export const useMembershipPrice = ({
  code,
  queryConfig,
}: UseMembershipPriceOptions) => {
  return useQuery({
    ...membershipPriceQueryOptions(code),
    ...queryConfig,
  });
};
