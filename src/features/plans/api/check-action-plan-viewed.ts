import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export interface CheckActionPlanViewedResponse {
  hasBeenViewed: boolean;
  lastViewedAt?: string;
}

export const checkActionPlanViewed = (
  planId: string,
): Promise<CheckActionPlanViewedResponse> => {
  return api.get(`/plans/${planId}/view-status`);
};

export const checkActionPlanViewedQueryOptions = (planId: string) => {
  return queryOptions({
    queryKey: ['action-plan-viewed', planId],
    queryFn: () => checkActionPlanViewed(planId),
    enabled: !!planId,
  });
};

type UseCheckActionPlanViewedOptions = {
  planId: string;
  queryConfig?: QueryConfig<typeof checkActionPlanViewedQueryOptions>;
};

export const useCheckActionPlanViewed = ({
  planId,
  queryConfig,
}: UseCheckActionPlanViewedOptions) => {
  return useQuery({
    ...checkActionPlanViewedQueryOptions(planId),
    ...queryConfig,
  });
};
