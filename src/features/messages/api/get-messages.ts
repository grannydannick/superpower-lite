import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ChatMessage } from '@/types/api';

export const getMessages = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ChatMessage[]> => {
  return api.get(`chat/${chatId}/messages`);
};

export const getMessagesQueryOptions = (chatId: string) => {
  return queryOptions({
    queryKey: ['chat', chatId],
    queryFn: () => getMessages({ chatId }),
  });
};

type UseMessagesOptions = {
  queryConfig?: QueryConfig<typeof getMessagesQueryOptions>;
  chatId: string;
};

export const useMessages = ({ queryConfig, chatId }: UseMessagesOptions) => {
  return useQuery({
    ...getMessagesQueryOptions(chatId),
    ...queryConfig,
  });
};
