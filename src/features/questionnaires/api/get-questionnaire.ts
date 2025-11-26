import { Questionnaire } from '@medplum/fhirtypes';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export const getQuestionnaire = ({
  identifier,
}: {
  identifier: string;
}): Promise<{
  questionnaire: Questionnaire;
}> => {
  return api.get(`/questionnaires/${identifier}`);
};

export const getQuestionnaireQueryOptions = (identifier: string) => {
  return queryOptions({
    queryKey: ['questionnaire', identifier],
    queryFn: () => getQuestionnaire({ identifier }),
  });
};

type UseQuestionnaireOptions = {
  identifier: string;
  queryConfig?: QueryConfig<typeof getQuestionnaireQueryOptions>;
};

export const useQuestionnaire = ({
  identifier,
  queryConfig,
}: UseQuestionnaireOptions) => {
  return useQuery({
    ...getQuestionnaireQueryOptions(identifier),
    ...queryConfig,
  });
};
