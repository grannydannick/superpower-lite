import { QuestionnaireResponse } from '@medplum/fhirtypes';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export const getQuestionnaireResponse = ({
  identifier,
  statuses,
}: {
  identifier: string;
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
  return api.get(`/questionnaire-response/${identifier}`, {
    params: { statusQuery: statuses?.join(',') },
  });
};

export const getQuestionnaireResponseQueryOptions = (
  identifier: string,
  statuses?: (
    | 'completed'
    | 'in-progress'
    | 'stopped'
    | 'entered-in-error'
    | 'amended'
  )[],
) => {
  return queryOptions({
    queryKey: ['questionnaire-response', identifier],
    queryFn: () => getQuestionnaireResponse({ identifier, statuses }),
  });
};

type UseQuestionnaireResponseOptions = {
  identifier: string;
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
  identifier,
  statuses,
  queryConfig,
}: UseQuestionnaireResponseOptions) => {
  return useQuery({
    ...getQuestionnaireResponseQueryOptions(identifier, statuses),
    ...queryConfig,
  });
};
