import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getChatQueryOptions } from '@/features/messages/api/get-chat';
import { getHistoryQueryOptions } from '@/features/messages/api/get-history';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Visibility } from '@/types/api';

export const updateChat = async ({
  chatId,
  data,
}: {
  chatId: string;
  data: { title?: string; visibility?: Visibility };
}) => {
  return api.post(`/chat/${chatId}`, data);
};

type UseUpdateChatOptions = {
  mutationConfig?: MutationConfig<typeof updateChat>;
};

export const useUpdateChat = ({
  mutationConfig,
}: UseUpdateChatOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      const variables = args[1];
      void queryClient.invalidateQueries({
        queryKey: getHistoryQueryOptions().queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getChatQueryOptions(variables.chatId).queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateChat,
  });
};
