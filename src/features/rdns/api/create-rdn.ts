import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { Rdn } from '@/types/api';

import { getRdnsQueryOptions } from './get-rdns';

export const createRdnInputSchema = z.object({
  licensed: z.string().min(1),
  npi: z.string().optional(),
  schedulingLink: z.string(),
  userId: z.string().min(1),
});

export type CreateRdnInput = z.infer<typeof createRdnInputSchema>;

export const createRdn = ({
  data,
}: {
  data: CreateRdnInput;
}): Promise<{ rdn: Rdn }> => {
  const request = {
    ...data,
    licensed: data.licensed.split(',').map((l) => l.trim().toUpperCase()),
  };
  return api.post('/admin/rdns', request);
};

type UseCreateRdnOptions = {
  mutationConfig?: MutationConfig<typeof createRdn>;
};

export const useCreateRdn = ({ mutationConfig }: UseCreateRdnOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getRdnsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createRdn,
  });
};
