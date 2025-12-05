import { QuestionnaireResponse } from '@medplum/fhirtypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getTimelineQueryOptions } from '@/features/homepage/api/get-timeline';
import { getQuestionnaireResponseQueryOptions } from '@/features/questionnaires/api/get-questionnaire-response';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { QuestionnaireName } from '@/types/api';

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

export type UpdateQuestionnaireResponseVariables = {
  data: UpdateQuestionnaireInput;
  identifier: string | QuestionnaireName; // id, or most recent questionnaire response by identifier or name
  /** Additional query identifiers to invalidate (e.g., the original query identifier if different from the response ID) */
  invalidateIdentifiers?: (string | QuestionnaireName)[];
};

export const updateQuestionnaireResponse = ({
  data,
  identifier,
}: UpdateQuestionnaireResponseVariables): Promise<{
  questionnaireResponse: QuestionnaireResponse;
}> => {
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
      // Invalidate additional identifiers (e.g., the original query identifier if different from the response ID)
      variables.invalidateIdentifiers?.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: getQuestionnaireResponseQueryOptions(id).queryKey,
        });
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
