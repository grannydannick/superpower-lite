import { Questionnaire } from '@medplum/fhirtypes';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { QuestionnaireName } from '@/types/api';

export const getQuestionnaire = ({
  questionnaireName,
}: {
  questionnaireName: QuestionnaireName;
}): Promise<{
  questionnaire: Questionnaire;
}> => {
  return api.get(`/questionnaires/${questionnaireName}`);
};

export const getQuestionnaireQueryOptions = (
  questionnaireName: QuestionnaireName,
) => {
  return queryOptions({
    queryKey: ['questionnaire', questionnaireName],
    queryFn: () => getQuestionnaire({ questionnaireName }),
  });
};

type UseQuestionnaireOptions = {
  questionnaireName: QuestionnaireName;
  queryConfig?: QueryConfig<typeof getQuestionnaireQueryOptions>;
};

export const useQuestionnaire = ({
  questionnaireName,
  queryConfig,
}: UseQuestionnaireOptions) => {
  return useQuery({
    ...getQuestionnaireQueryOptions(questionnaireName),
    ...queryConfig,
  });
};
