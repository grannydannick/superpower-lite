import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Message } from '@/types/api';

export const createMessageInputSchema = z.object({
  text: z.string().min(1, 'At least one letter is required'),
  type: z.enum(['concierge', 'service', 'plan']),
  serviceName: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const createMessage = ({
  data,
}: {
  data: CreateMessageInput;
}): Promise<Message> => {
  return api.post(`/notifications/concierge`, data);
};

type UseCreateMessageOptions = {
  mutationConfig?: MutationConfig<typeof createMessage>;
};

export const useCreateMessage = ({
  mutationConfig,
}: UseCreateMessageOptions = {}) => {
  const { ...restConfig } = mutationConfig || {};

  return useMutation({
    ...restConfig,
    mutationFn: createMessage,
  });
};
