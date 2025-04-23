import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Chat } from '@/types/api';

export const getHistory = async (): Promise<Chat[]> => {
  return api.get('/chat/history');
};

export const getHistoryQueryOptions = () => {
  return queryOptions({
    queryKey: ['history'],
    queryFn: () => getHistory(),
  });
};

type UseHistoryOptions = {
  queryConfig?: QueryConfig<typeof getHistoryQueryOptions>;
};

export const useHistory = ({ queryConfig }: UseHistoryOptions = {}) => {
  return useQuery({
    ...getHistoryQueryOptions(),
    ...queryConfig,
  });
};
