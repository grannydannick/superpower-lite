import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { BridgePolicy } from '@/types/api';

export const createPolicyInputSchema = z
  .object({
    payer: z.object({
      id: z.string(),
      memberId: z.boolean(),
      code: z.string(),
      name: z.string(),
    }),
    memberId: z.string().optional(),
    state: z.string().min(2),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.date(),
  })
  .refine(
    (data) => {
      if (data.payer.memberId) {
        return typeof data.memberId === 'string' && data.memberId.trim() !== '';
      }
      return true;
    },
    {
      path: ['memberId'], // This sets the path of the error to the memberId field
      message: 'Member ID is required for this provider.',
    },
  );

export type CreatePolicyInput = z.infer<typeof createPolicyInputSchema>;

export const createPolicy = ({
  data,
}: {
  data: CreatePolicyInput;
}): Promise<BridgePolicy> => {
  const request = {
    person: {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
    },
    state: data.state,
    payerId: data.payer.id,
    memberId: data.memberId ? data.memberId : undefined,
  };

  return api.post('/insurance/policies', request);
};

type UseCreatePolicyOptions = {
  mutationConfig?: MutationConfig<typeof createPolicy>;
};

export const useCreatePolicy = ({
  mutationConfig,
}: UseCreatePolicyOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createPolicy,
  });
};
