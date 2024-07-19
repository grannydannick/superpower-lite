import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Questionnaire } from '@/types/api';

import { getQuestionnaireQueryOptions } from './get-questionnaire';

export const updateQuestionnaireInputSchema = z.object({
  id: z.string().min(1, 'Required'),
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
  return api.patch(`/questionnaires/${questionnaireId}`, data);
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
      queryClient.refetchQueries({
        queryKey: getQuestionnaireQueryOptions(data.id).queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateQuestionnaire,
  });
};
