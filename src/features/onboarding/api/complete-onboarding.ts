import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';

export const completeOnboardingInputSchema = z.object({
  status: z.string().min(1, 'Required'),
});

export type CompleteOnboardingInput = z.infer<
  typeof completeOnboardingInputSchema
>;

export const completeOnboarding = ({
  data,
}: {
  data: CompleteOnboardingInput;
}): Promise<void> => {
  return api.put(`users/onboarding`, data);
};

type UseCompleteOnboardingOptions = {
  mutationConfig?: MutationConfig<typeof completeOnboarding>;
};

export const useCompleteOnboarding = ({
  mutationConfig,
}: UseCompleteOnboardingOptions = {}) => {
  const { refetch } = useUser();
  const navigate = useNavigate();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      await refetch();
      localStorage.removeItem('onboarding');
      navigate('/');
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: completeOnboarding,
  });
};
