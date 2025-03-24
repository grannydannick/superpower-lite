import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { FhirCarePlan } from '@/types/api';

export const getPlan = ({
  id,
}: {
  id: string;
}): Promise<{ actionPlan: FhirCarePlan }> => {
  return api.get(`/plans/${id}`);
};

export const getPlanQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['plans', id],
    queryFn: () => getPlan({ id }),
  });
};

type UsePlanOptions = {
  id: string;
  queryConfig?: QueryConfig<typeof getPlanQueryOptions>;
};

export const usePlan = ({ id, queryConfig }: UsePlanOptions) => {
  return useQuery({
    ...getPlanQueryOptions(id),
    ...queryConfig,
  });
};
