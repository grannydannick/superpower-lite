import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const sendMagicLinkInputSchema = z.object({
  email: z.string().email('Valid email address is required'),
  redirectTo: z.string().optional(),
  origin: z.string().optional(),
});

export type SendMagicLinkInput = z.infer<typeof sendMagicLinkInputSchema>;

export const sendMagicLink = ({
  data,
}: {
  data: SendMagicLinkInput;
}): Promise<{ success: boolean }> => {
  return api.post('/auth/send-magic-link', data);
};

type UseSendMagicLinkOptions = {
  mutationConfig?: MutationConfig<typeof sendMagicLink>;
};

export const useSendMagicLink = ({
  mutationConfig,
}: UseSendMagicLinkOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: sendMagicLink,
  });
};
