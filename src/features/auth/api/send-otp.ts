import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { authClient } from '@/lib/auth-client';
import { MutationConfig } from '@/lib/react-query';

export const sendOtpInputSchema = z.object({
  email: z.string().email('Valid email address is required'),
  toc: z.literal<boolean>(true),
});

export type SendOtpInput = z.infer<typeof sendOtpInputSchema>;

export const sendOtp = async ({
  data,
}: {
  data: SendOtpInput;
}): Promise<void> => {
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email: data.email,
    type: 'sign-in',
  });

  if (error) {
    throw new Error(error.message);
  }
};

type UseSendOtpOptions = {
  mutationConfig?: MutationConfig<typeof sendOtp>;
};

export const useSendOtp = ({ mutationConfig }: UseSendOtpOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: sendOtp,
  });
};
