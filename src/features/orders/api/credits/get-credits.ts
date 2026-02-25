import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Credit, CreditType } from '@/types/api';

export const getCredits = (
  type: CreditType = 'default',
): Promise<{ credits: Credit[] }> => {
  return api.get('/credits', { params: { type } });
};

export const getCreditsQueryOptions = (type: CreditType = 'default') => {
  return queryOptions({
    queryKey: ['credits', type],
    queryFn: () => getCredits(type),
    // this is on purpose to remove issues with credits / etc
    // added oct 7, 2025 by NM
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });
};

type UseCreditsOptions = {
  type?: CreditType;
  queryConfig?: QueryConfig<typeof getCreditsQueryOptions>;
};

export const useCredits = ({
  type = 'default',
  queryConfig,
}: UseCreditsOptions = {}) => {
  return useQuery({
    ...getCreditsQueryOptions(type),
    ...queryConfig,
  });
};
