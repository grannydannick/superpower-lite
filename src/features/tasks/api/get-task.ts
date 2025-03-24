import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Task, TaskName } from '@/types/api';

export const getTask = ({
  taskName,
}: {
  taskName: TaskName;
}): Promise<{
  task: Task;
}> => {
  return api.get(`/tasks/${taskName}`);
};

export const getTaskQueryOptions = (taskName: TaskName) => {
  return queryOptions({
    queryKey: ['task', taskName],
    queryFn: () => getTask({ taskName }),
  });
};

type UseQuestionnaireOptions = {
  taskName: TaskName;
  queryConfig?: QueryConfig<typeof getTaskQueryOptions>;
};

export const useTask = ({ taskName, queryConfig }: UseQuestionnaireOptions) => {
  return useQuery({
    ...getTaskQueryOptions(taskName),
    ...queryConfig,
  });
};
