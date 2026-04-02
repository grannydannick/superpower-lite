import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { authClient } from '@/lib/auth-client';
import { MutationConfig } from '@/lib/react-query';

export const sendMagicLinkInputSchema = z.object({
  email: z.string().email('Valid email address is required'),
  redirectTo: z.string().optional(),
  origin: z.string().optional(),
});

export type SendMagicLinkInput = z.infer<typeof sendMagicLinkInputSchema>;

export const sendMagicLink = async ({
  data,
}: {
  data: SendMagicLinkInput;
}): Promise<{ success: boolean }> => {
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email: data.email,
    type: 'sign-in',
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
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
