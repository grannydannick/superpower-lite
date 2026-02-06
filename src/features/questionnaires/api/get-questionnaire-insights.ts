import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { QuestionnaireInsights } from '@/types/api';

// Deprecated: onboarding-intake is legacy and only kept for family insights.
type QuestionnaireInsightsName = 'onboarding-intake';

export const getQuestionnaireInsights = ({
  questionnaireName,
}: {
  questionnaireName: QuestionnaireInsightsName;
}): Promise<{
  insights: QuestionnaireInsights[];
}> => {
  return api.get(`/questionnaires/${questionnaireName}/insights`);
};

export const getQuestionnaireInsightsQueryOptions = (
  questionnaireName: QuestionnaireInsightsName,
) => {
  return queryOptions({
    queryKey: ['questionnaire', questionnaireName, 'insights'],
    queryFn: () => getQuestionnaireInsights({ questionnaireName }),
  });
};

type UseQuestionnaireOptions = {
  questionnaireName: QuestionnaireInsightsName;
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
