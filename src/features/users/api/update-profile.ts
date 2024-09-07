import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';
import { User } from '@/types/api';

/*
 * Used as main type for all form inputs where we need to add/update address
 * */
export const formAddressInputSchema = z.object({
  line1: z.string().min(1),
  postalCode: z.string().min(5).max(5),
  city: z.string().min(1),
  state: z.string().min(1),
});

export type FormAddressInput = z.infer<typeof formAddressInputSchema>;

/*
 * Should not be used in forms but rather as field in other zod schemas if needed
 * */
export const addressInputSchema = z.object({
  line: z.array(z.string()),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  postalCode: z.string().min(5, 'Required'),
});

/*
 * Used as internal type to prepare object for server
 * */
const primaryAddressInputSchema = z.object({
  address: addressInputSchema,
  id: z.string().optional(),
});

/*
 * Used as internal type to prepare object for server
 * */
const activeAddressInputSchema = z.object({
  address: addressInputSchema,
  id: z.string().optional(),
});

/*
 * Used as internal type to prepare object for server
 * */
const updateProfileInputSchema = z.object({
  primaryAddress: primaryAddressInputSchema.optional(),
  activeAddress: activeAddressInputSchema.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const updateProfile = ({
  data,
}: {
  data: UpdateProfileInput;
}): Promise<User> => {
  return api.put(`/users`, data);
};

type UseUpdateProfileOptions = {
  mutationConfig?: MutationConfig<typeof updateProfile>;
};

export const useUpdateProfile = ({
  mutationConfig,
}: UseUpdateProfileOptions = {}) => {
  const { refetch: refetchUser } = useUser();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      refetchUser();
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: updateProfile,
  });
};
