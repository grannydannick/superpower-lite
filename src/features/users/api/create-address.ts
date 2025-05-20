import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';
import { AddressInput } from '@/types/address';
import { User } from '@/types/api';

export const createAddress = ({
  data,
}: {
  data: AddressInput;
}): Promise<User> => {
  return api.post(`/users/address`, data);
};

type UseCreateAddressOptions = {
  mutationConfig?: MutationConfig<typeof createAddress>;
};

export const useCreateAddress = ({
  mutationConfig,
}: UseCreateAddressOptions = {}) => {
  const { refetch: refetchUser } = useUser();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      refetchUser();
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createAddress,
  });
};
