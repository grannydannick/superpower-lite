import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { getTaskQueryOptions } from '@/features/tasks/api/get-task';
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
}): Promise<Task> => {
  return api.patch(`/tasks/${taskName}`, data);
};

type UseUpdateTaskOptions = {
  mutationConfig?: MutationConfig<typeof updateTask>;
};

export const useUpdateTask = ({
  mutationConfig,
}: UseUpdateTaskOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getTaskQueryOptions(variables.taskName).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: updateTask,
  });
};
