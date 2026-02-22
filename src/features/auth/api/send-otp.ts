import { useMutation } from '@tanstack/react-query';
import isMobilePhone from 'validator/es/lib/isMobilePhone';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

export const sendOtpInputSchema = z.object({
  phone: z.string().refine(isMobilePhone),
  toc: z.literal<boolean>(true),
});

export type SendOtpInput = z.infer<typeof sendOtpInputSchema>;

export const sendOtp = ({ data }: { data: SendOtpInput }): Promise<void> => {
  return api.post('/send-otp', { phone: data.phone });
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
