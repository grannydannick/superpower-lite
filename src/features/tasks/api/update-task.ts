import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';

import { getTaskQueryOptions } from '@/features/tasks/api/get-task';
import { useAnalytics } from '@/hooks/use-analytics';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Task, TaskName } from '@/types/api';

export const updateTaskInputSchema = z.object({
  status: z.enum(['in-progress', 'completed']).optional(),
  progress: z.number().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export const updateTask = ({
  data,
  taskName,
}: {
  data: UpdateTaskInput;
  taskName: TaskName;
}): Promise<{ task: Task }> => {
  return api.patch(`/tasks/${taskName}`, data);
};

type UseUpdateTaskOptions = {
  mutationConfig?: MutationConfig<typeof updateTask>;
};

export const useUpdateTask = ({
  mutationConfig,
}: UseUpdateTaskOptions = {}) => {
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables, onMutateResult, mutationFunctionContext) => {
      const prefix = `task_${data.task.name}`.toLowerCase();

      const set: Record<string, any> = {};
      set[`${prefix}_status`] = data.task.status;
      set[`${prefix}_progress`] = data.task.progress;
      if (data.task.status === 'completed')
        set[`${prefix}_completed_at`] = new Date().toISOString();

      // Track task update

      track('task_updated', {
        task_name: data.task.name,
        task_status: data.task.status,
        task_progress: data.task.progress,
        $set: set,
      });

      queryClient.invalidateQueries({
        queryKey: getTaskQueryOptions(variables.taskName).queryKey,
      });
      onSuccess?.(data, variables, onMutateResult, mutationFunctionContext);
    },
    ...restConfig,
    mutationFn: updateTask,
  });
};
