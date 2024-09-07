import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const createInteractionEventInputSchema = z.object({
  eventType: z.string(),
  metadata: z.record(z.string(), z.any()),
});

export type CreateInteractionEventInput = z.infer<
  typeof createInteractionEventInputSchema
>;

export const createInteractionEvent = ({
  data,
}: {
  data: CreateInteractionEventInput;
}): Promise<void> => {
  return api.post('/interaction-event/submit', data);
};

type UseCreateInteractionEventOptions = {
  mutationConfig?: MutationConfig<typeof createInteractionEvent>;
};

export const useCreateInteractionEvent = ({
  mutationConfig,
}: UseCreateInteractionEventOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createInteractionEvent,
  });
};
