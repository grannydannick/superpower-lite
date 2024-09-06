import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { getUsersQueryOptions } from '@/features/users/api/get-users';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Rdn } from '@/types/api';

export const assignRdnInputSchema = z.object({
  rdnId: z.string(),
  userId: z.string(),
});

export type AssignRdnInput = z.infer<typeof assignRdnInputSchema>;

export const assignRdn = ({
  data,
}: {
  data: AssignRdnInput;
}): Promise<{ rdn: Rdn }> => {
  return api.post(`admin/rdns/${data.rdnId}/assign`, { userId: data.userId });
};

type UseAssignRdnOptions = {
  mutationConfig?: MutationConfig<typeof assignRdn>;
};

export const useAssignRdn = ({ mutationConfig }: UseAssignRdnOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getUsersQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: assignRdn,
  });
};
