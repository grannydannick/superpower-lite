import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { BridgePatient } from '@/types/api';

export const createPatientInputSchema = z.object({
  memberId: z.string().optional(),
  state: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().min(1),
  dateOfBirth: z.date(),
  externalId: z.string().optional(),
  phone: z.string().optional(),
  address: z
    .object({
      state: z.string().min(2),
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  coverage: z.array(
    z.object({
      rank: z.number(),
      policyId: z.string().min(1),
    }),
  ),
});

export type CreatePatientInput = z.infer<typeof createPatientInputSchema>;

export const createPatient = ({
  data,
}: {
  data: CreatePatientInput;
}): Promise<BridgePatient> => {
  return api.post('/insurance/patients', data);
};

type UseCreatePatientsOptions = {
  mutationConfig?: MutationConfig<typeof createPatient>;
};

export const useCreatePatient = ({
  mutationConfig,
}: UseCreatePatientsOptions = {}) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createPatient,
  });
};
