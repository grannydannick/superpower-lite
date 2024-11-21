import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Questionnaire } from '@/types/api';

export const getQuestionnaires = (): Promise<{
  questionnaires: Questionnaire[];
}> => {
  return api.get(`/users/questionnaires`);
};

export const getQuestionnairesQueryOptions = () => {
  return queryOptions({
    queryKey: ['questionnaires'],
    queryFn: getQuestionnaires,
  });
};

type UseQuestionnairesOptions = {
  queryConfig?: QueryConfig<typeof getQuestionnairesQueryOptions>;
};

export const useQuestionnaires = ({
  queryConfig,
}: UseQuestionnairesOptions = {}) => {
  return useQuery({
    ...getQuestionnairesQueryOptions(),
    ...queryConfig,
  });
};
