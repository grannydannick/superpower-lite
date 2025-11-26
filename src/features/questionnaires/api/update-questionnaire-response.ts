import { QuestionnaireResponse } from '@medplum/fhirtypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getTimelineQueryOptions } from '@/features/home/api/get-timeline';
import { getQuestionnaireResponseQueryOptions } from '@/features/questionnaires/api/get-questionnaire-response';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const updateQuestionnaireResponseInputSchema = z.object({
  status: z
    .enum([
      'stopped',
      'entered-in-error',
      'amended',
      'completed',
      'in-progress',
    ])
    .optional(),
  item: z.array(z.any()).optional(),
});

export type UpdateQuestionnaireInput = z.infer<
  typeof updateQuestionnaireResponseInputSchema
>;

export const updateQuestionnaireResponse = ({
  data,
  identifier,
}: {
  data: UpdateQuestionnaireInput;
  identifier: string;
}): Promise<{ questionnaireResponse: QuestionnaireResponse }> => {
  return api.patch(`/questionnaire-response/${identifier}`, data);
};

type UseUpdateQuestionnaireResponseOptions = {
  mutationConfig?: MutationConfig<typeof updateQuestionnaireResponse>;
};

export const useUpdateQuestionnaireResponse = ({
  mutationConfig,
}: UseUpdateQuestionnaireResponseOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getQuestionnaireResponseQueryOptions(variables.identifier)
          .queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });
      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: updateQuestionnaireResponse,
  });
};
