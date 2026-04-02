import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getHistoryQueryOptions } from '@/features/messages/api/get-history';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const deleteChat = ({ chatId }: { chatId: string }) => {
  return api.delete(`/chat/${chatId}`);
};

type UseDeleteChatOptions = {
  mutationConfig?: MutationConfig<typeof deleteChat>;
};

export const useDeleteChat = ({
  mutationConfig,
}: UseDeleteChatOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: getHistoryQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteChat,
  });
};
