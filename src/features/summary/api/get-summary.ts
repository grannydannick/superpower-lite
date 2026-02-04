import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { SummaryResult } from '@/types/api';

export const DEV_BYPASS_CARE_PLAN_KEY = 'dev-bypass-care-plan';

export const getSummary = (): Promise<SummaryResult> => {
  return api.get(`/summary`);
};

export const getSummaryQueryOptions = () => {
  return queryOptions({
    queryKey: ['summary'],
    queryFn: () => getSummary(),
  });
};

type UseSummaryOptions = {
  queryConfig?: QueryConfig<typeof getSummaryQueryOptions>;
};

export const useSummary = ({ queryConfig }: UseSummaryOptions = {}) => {
  const query = useQuery({
    ...getSummaryQueryOptions(),
    ...queryConfig,
  });

  // Dev override for hasCompletedCarePlan
  if (
    process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    localStorage.getItem(DEV_BYPASS_CARE_PLAN_KEY) === 'true' &&
    query.data
  ) {
    return {
      ...query,
      data: {
        ...query.data,
        hasCompletedCarePlan: true,
      },
    };
  }

  return query;
};
