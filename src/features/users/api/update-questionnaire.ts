import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Questionnaire } from '@/types/api';

export const updateQuestionnaireInputSchema = z.object({
  progress: z.number().optional(),
  status: z.enum(['INCOMPLETE', 'COMPLETE', 'ACTIVE']).optional(),
});

export type UpdateQuestionnaireInput = z.infer<
  typeof updateQuestionnaireInputSchema
>;

export const updateQuestionnaire = ({
  data,
  questionnaireId,
}: {
  data: UpdateQuestionnaireInput;
  questionnaireId: string;
}): Promise<Questionnaire> => {
  return api.put(`/users/questionnaire/${questionnaireId}`, data);
};

type UseUpdateQuestionnaireOptions = {
  mutationConfig?: MutationConfig<typeof updateQuestionnaire>;
};

export const useUpdateQuestionnaire = ({
  mutationConfig,
}: UseUpdateQuestionnaireOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateQuestionnaire,
  });
};
