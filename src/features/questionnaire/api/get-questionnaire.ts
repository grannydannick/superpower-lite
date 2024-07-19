import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Questionnaire } from '@/types/api';

export const getQuestionnaire = ({
  questionnaireId,
}: {
  questionnaireId: string;
}): Promise<Questionnaire> => {
  return api.get(`/questionnaires/${questionnaireId}`);
};

export const getQuestionnaireQueryOptions = (questionnaireId: string) => {
  return queryOptions({
    queryKey: ['questionnaires', questionnaireId],
    queryFn: () => getQuestionnaire({ questionnaireId }),
  });
};

type UseQuestionnaireOptions = {
  questionnaireId: string;
  queryConfig?: QueryConfig<typeof getQuestionnaireQueryOptions>;
};

export const useQuestionnaire = ({
  questionnaireId,
  queryConfig,
}: UseQuestionnaireOptions) => {
  return useQuery({
    ...getQuestionnaireQueryOptions(questionnaireId),
    ...queryConfig,
  });
};
