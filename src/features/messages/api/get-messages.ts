import { queryOptions, useQuery } from '@tanstack/react-query';
import { UIMessage } from 'ai';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export const DEFAULT_MESSAGES_PAGE_SIZE = 10;

export type MessagesSort = 'asc' | 'desc';
export type MessagesCursor = { id: string };

interface GetMessagesOptions {
  chatId: string;
  cursor?: MessagesCursor;
  sort?: MessagesSort;
  limit?: number;
  hideToast?: boolean;
}

export const getMessages = async ({
  chatId,
  cursor,
  sort = 'desc',
  limit = DEFAULT_MESSAGES_PAGE_SIZE,
  hideToast,
}: GetMessagesOptions): Promise<UIMessage[]> => {
  return api.get(`/chat/${chatId}/messages`, {
    headers: hideToast === true ? { 'x-hide-toast': 'true' } : undefined,
    params: {
      sort,
      limit,
      ...(cursor ? { cursor } : {}),
    },
  });
};

export const getMessagesQueryOptions = (
  chatId: string,
  options?: { hideToast?: boolean },
) => {
  return queryOptions({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const page = await getMessages({
        chatId,
        sort: 'desc',
        hideToast: options?.hideToast,
      });
      return page.slice().reverse();
    },
  });
};

type UseMessagesOptions = {
  queryConfig?: QueryConfig<typeof getMessagesQueryOptions>;
  chatId: string;
  hideToast?: boolean;
};

export const useMessages = ({
  queryConfig,
  chatId,
  hideToast,
}: UseMessagesOptions) => {
  return useQuery({
    ...getMessagesQueryOptions(chatId, { hideToast }),
    ...queryConfig,
  });
};
