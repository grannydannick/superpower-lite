import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { QueryConfig } from '@/lib/react-query';

export const getRxTasks = (
  id?: string,
): Promise<{ failed_payments: number }> => {
  return api.get(`/rx/patient/${id}/tasks`);
};

export const getRxTasksQueryOptions = (id?: string) => {
  return queryOptions({
    queryKey: ['rx-tasks'],
    queryFn: () => getRxTasks(id),
  });
};

type UseRxTasksOptions = {
  queryConfig?: QueryConfig<typeof getRxTasksQueryOptions>;
};

export const useRxTasks = ({ queryConfig }: UseRxTasksOptions = {}) => {
  const { data: user } = useUser();

  const id = user?.id;

  return useQuery({
    ...getRxTasksQueryOptions(id),
    ...queryConfig,
  });
};
