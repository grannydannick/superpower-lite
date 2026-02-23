import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { User } from '@/types/api';

export const verifyMagicLinkInputSchema = z.object({
  token: z.string(),
});

export type VerifyMagicLinkInput = z.infer<typeof verifyMagicLinkInputSchema>;

export interface VerifyMagicLinkResponse {
  success: boolean;
  user: User;
  authTokens: {
    accessToken: string;
    refreshToken?: string;
  };
  redirectTo?: string;
  origin?: string;
}

export const verifyMagicLink = async ({
  data,
}: {
  data: VerifyMagicLinkInput;
}): Promise<VerifyMagicLinkResponse> => {
  // Suppress global toast: the verify-email route handles redirects and UX
  // explicitly based on server response (success or invalid/expired token).
  return api.post(`/auth/verify-magic-link`, data, {
    headers: { 'x-hide-toast': 'true' },
  }) as Promise<VerifyMagicLinkResponse>;
};

type UseVerifyMagicLinkOptions = {
  mutationConfig?: MutationConfig<typeof verifyMagicLink>;
};

export const useVerifyMagicLink = ({
  mutationConfig,
}: UseVerifyMagicLinkOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (response, ...args) => {
      onSuccess?.(response, ...args);
    },
    ...restConfig,
    mutationFn: verifyMagicLink,
  });
};
