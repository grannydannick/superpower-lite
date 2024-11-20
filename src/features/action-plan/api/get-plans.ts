import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Plan } from '@/types/api';

export const getPlans = (
  page = 1,
): Promise<{
  actionPlans: Plan[];
}> => {
  return api.get(`/plans`, {
    params: {
      page,
    },
  });
};

export const getPlansQueryOptions = ({ page }: { page?: number } = {}) => {
  return queryOptions({
    queryKey: page ? ['actionPlans', { page }] : ['actionPlans'],
    queryFn: () => getPlans(page),
  });
};

type UsePlansOptions = {
  page?: number;
  queryConfig?: QueryConfig<typeof getPlansQueryOptions>;
};

export const usePlans = ({ queryConfig, page }: UsePlansOptions = {}) => {
  return useQuery({
    ...getPlansQueryOptions({ page }),
    ...queryConfig,
  });
};
