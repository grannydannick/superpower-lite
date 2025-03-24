import { QuestionnaireResponse } from '@medplum/fhirtypes';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { QuestionnaireName } from '@/types/api';

export const getQuestionnaireResponse = ({
  questionnaireName,
}: {
  questionnaireName: QuestionnaireName;
}): Promise<{
  questionnaireResponse: QuestionnaireResponse;
}> => {
  return api.get(`/questionnaires/${questionnaireName}/response`);
};

export const getQuestionnaireResponseQueryOptions = (
  questionnaireName: QuestionnaireName,
) => {
  return queryOptions({
    queryKey: ['questionnaire-response', questionnaireName],
    queryFn: () => getQuestionnaireResponse({ questionnaireName }),
  });
};

type UseQuestionnaireResponseOptions = {
  questionnaireName: QuestionnaireName;
  queryConfig?: QueryConfig<typeof getQuestionnaireResponseQueryOptions>;
};

export const useQuestionnaireResponse = ({
  questionnaireName,
  queryConfig,
}: UseQuestionnaireResponseOptions) => {
  return useQuery({
    ...getQuestionnaireResponseQueryOptions(questionnaireName),
    ...queryConfig,
  });
};
