import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';
import { formAddressInputSchema } from '@/types/address';
import { User } from '@/types/api';

export const updateUserInputSchema = z.object({
  firstName: z.string().min(2, 'Please enter your full first name.').optional(),
  lastName: z.string().min(2, 'Please enter your full last name.').optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  address: formAddressInputSchema.optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const updateUser = ({
  data,
}: {
  data: UpdateUserInput;
}): Promise<User> => {
  return api.put(`/users`, data);
};

type UseUpdateUserOptions = {
  mutationConfig?: MutationConfig<typeof updateUser>;
};

export const useUpdateUser = ({
  mutationConfig,
}: UseUpdateUserOptions = {}) => {
  const { refetch: refetchUser } = useUser();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      refetchUser();
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateUser,
  });
};
