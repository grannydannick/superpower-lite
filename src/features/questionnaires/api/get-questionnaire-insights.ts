import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { QuestionnaireInsights, QuestionnaireName } from '@/types/api';

export const getQuestionnaireInsights = ({
  questionnaireName,
}: {
  questionnaireName: QuestionnaireName;
}): Promise<{
  insights: QuestionnaireInsights[];
}> => {
  return api.get(`/questionnaires/${questionnaireName}/insights`);
};

export const getQuestionnaireInsightsQueryOptions = (
  questionnaireName: QuestionnaireName,
) => {
  return queryOptions({
    queryKey: ['questionnaire', questionnaireName, 'insights'],
    queryFn: () => getQuestionnaireInsights({ questionnaireName }),
  });
};

type UseQuestionnaireOptions = {
  questionnaireName: QuestionnaireName;
  queryConfig?: QueryConfig<typeof getQuestionnaireInsightsQueryOptions>;
};

export const useQuestionnaireInsights = ({
  questionnaireName,
  queryConfig,
}: UseQuestionnaireOptions) => {
  return useQuery({
    ...getQuestionnaireInsightsQueryOptions(questionnaireName),
    ...queryConfig,
  });
};
