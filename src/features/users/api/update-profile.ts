import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';
import { User } from '@/types/api';

/**
 * Used as main type for all form inputs where we need to add/update address
 */
export const formAddressInputSchema = z.object({
  line1: z
    .string()
    .min(3, { message: 'Address Line 1 must contain at least 3 characters.' })
    .regex(/^[a-zA-Z0-9 .-]+$/, {
      message: `Address Line 1 has invalid characters`,
    }),
  line2: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined || val.trim() === '' || /^[a-zA-Z0-9 .-]+$/.test(val),
      {
        message: `Address Line 2 has invalid characters`,
      },
    ),
  postalCode: z
    .string()
    .min(5, { message: 'Zip code must contain at least 5 characters.' }),
  city: z
    .string()
    .min(1, { message: 'City must contain at least 1 character.' }),
  state: z
    .string()
    .min(2, { message: 'State must contain at least 2 characters.' }),
  text: z.string().optional(),
});

export type FormAddressInput = z.infer<typeof formAddressInputSchema>;

/**
 * Should not be used in forms but rather as field in other zod schemas if needed
 */
export const addressInputSchema = z.object({
  line: z.array(z.string()),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  postalCode: z.string().min(5, 'Required'),
});

/**
 * Used as internal type to prepare object for server
 */
const primaryAddressInputSchema = z.object({
  address: addressInputSchema,
  id: z.string().optional(),
});

/**
 * Used as internal type to prepare object for server
 */
const activeAddressInputSchema = z.object({
  address: addressInputSchema,
  id: z.string().optional(),
});

/**
 * Used as internal type to prepare object for server
 */
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
