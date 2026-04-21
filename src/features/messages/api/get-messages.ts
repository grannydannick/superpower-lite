import { queryOptions, useQuery } from '@tanstack/react-query';
import { UIMessage } from 'ai';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export const DEFAULT_MESSAGES_PAGE_SIZE = 10;

export type MessagesSort = 'asc' | 'desc';
export type MessagesCursor = { id: string; skip?: number };

interface GetMessagesOptions {
  cursor?: MessagesCursor;
  sort?: MessagesSort;
  limit?: number;
  hideToast?: boolean;
}

export const getMessages = async ({
  cursor,
  sort = 'desc',
  limit = DEFAULT_MESSAGES_PAGE_SIZE,
  hideToast,
}: GetMessagesOptions): Promise<UIMessage[]> => {
  return api.get('/chat/messages', {
    headers: hideToast === true ? { 'x-hide-toast': 'true' } : undefined,
    params: {
      sort,
      limit,
      ...(cursor ? { cursor } : {}),
    },
  });
};

export const getTimelineQueryOptions = (options?: { hideToast?: boolean }) => {
  return queryOptions({
    queryKey: ['timeline'],
    queryFn: async () => {
      const page = await getMessages({
        sort: 'desc',
        hideToast: options?.hideToast,
      });
      return page.slice().reverse();
    },
  });
};

type UseTimelineOptions = {
  queryConfig?: QueryConfig<typeof getTimelineQueryOptions>;
  hideToast?: boolean;
};

export const useTimeline = ({
  queryConfig,
  hideToast,
}: UseTimelineOptions = {}) => {
  return useQuery({
    ...getTimelineQueryOptions({ hideToast }),
    ...queryConfig,
  });
};
