import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Chat } from '@/types/api';

export const DEFAULT_HISTORY_PAGE_SIZE = 10;

export type HistoryCursor = { id: string };

export const getHistoryPage = async ({
  cursor,
  limit = DEFAULT_HISTORY_PAGE_SIZE,
}: {
  cursor?: HistoryCursor;
  limit?: number;
}): Promise<Chat[]> => {
  return api.get('/chat/history', {
    params: {
      ...(limit && limit !== DEFAULT_HISTORY_PAGE_SIZE ? { limit } : {}),
      ...(cursor ? { cursor } : {}),
    },
  });
};

export const getHistoryQueryOptions = () => {
  return infiniteQueryOptions({
    queryKey: ['history'],
    queryFn: ({ pageParam }) =>
      getHistoryPage({ cursor: pageParam, limit: DEFAULT_HISTORY_PAGE_SIZE }),
    initialPageParam: undefined as HistoryCursor | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < DEFAULT_HISTORY_PAGE_SIZE) return;
      const last = lastPage[lastPage.length - 1];
      return last ? { id: last.id } : undefined;
    },
  });
};

type UseHistoryOptions = {
  queryConfig?: QueryConfig<typeof getHistoryQueryOptions>;
};

export const useHistory = ({ queryConfig }: UseHistoryOptions = {}) => {
  const query = useInfiniteQuery({
    ...getHistoryQueryOptions(),
    ...queryConfig,
  });

  let data: Chat[] | undefined = undefined;
  const pages = query.data?.pages;
  if (pages) {
    data = [];
    for (const page of pages) {
      for (const chat of page) {
        data.push(chat);
      }
    }
  }

  return {
    ...query,
    data,
  };
};
