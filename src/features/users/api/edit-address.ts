import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getServicesQueryOptions } from '@/features/services/api';
import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';
import { AddressInput } from '@/types/address';
import { User } from '@/types/api';

export const editAddress = ({
  data,
  id,
}: {
  id: string;
  data: AddressInput;
}): Promise<User> => {
  return api.put(`/users/address/${id}`, data);
};

type UseEditAddressOptions = {
  mutationConfig?: MutationConfig<typeof editAddress>;
};

export const useEditAddress = ({
  mutationConfig,
}: UseEditAddressOptions = {}) => {
  const { refetch: refetchUser } = useUser();
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      refetchUser();

      queryClient.refetchQueries({
        queryKey: getServicesQueryOptions().queryKey,
      });

      queryClient.refetchQueries({
        queryKey: ['service'],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: editAddress,
  });
};
