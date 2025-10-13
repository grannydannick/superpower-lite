import { QuestionnaireResponse } from '@medplum/fhirtypes';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { QuestionnaireName } from '@/types/api';

export const getQuestionnaireResponse = ({
  questionnaireName,
  statuses,
}: {
  questionnaireName: QuestionnaireName;
  statuses?: (
    | 'completed'
    | 'in-progress'
    | 'stopped'
    | 'entered-in-error'
    | 'amended'
  )[];
}): Promise<{
  questionnaireResponse: QuestionnaireResponse | null;
}> => {
  return api.get(`/questionnaires/${questionnaireName}/response`, {
    params: { statusQuery: statuses?.join(',') },
  });
};

export const getQuestionnaireResponseQueryOptions = (
  questionnaireName: QuestionnaireName,
  statuses?: (
    | 'completed'
    | 'in-progress'
    | 'stopped'
    | 'entered-in-error'
    | 'amended'
  )[],
) => {
  return queryOptions({
    queryKey: ['questionnaire-response', questionnaireName],
    queryFn: () => getQuestionnaireResponse({ questionnaireName, statuses }),
  });
};

type UseQuestionnaireResponseOptions = {
  questionnaireName: QuestionnaireName;
  statuses?: (
    | 'completed'
    | 'in-progress'
    | 'stopped'
    | 'entered-in-error'
    | 'amended'
  )[];
  queryConfig?: QueryConfig<typeof getQuestionnaireResponseQueryOptions>;
};

export const useQuestionnaireResponse = ({
  questionnaireName,
  statuses,
  queryConfig,
}: UseQuestionnaireResponseOptions) => {
  return useQuery({
    ...getQuestionnaireResponseQueryOptions(questionnaireName, statuses),
    ...queryConfig,
  });
};
