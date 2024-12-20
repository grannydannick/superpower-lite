import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { BridgePayer } from '@/types/api';

export const getPayersInputSchema = z.object({
  query: z.string().min(1, 'Required'),
  limit: z.number(),
});

export type GetPayersInput = z.infer<typeof getPayersInputSchema>;

export const getPayers = async ({
  data,
}: {
  data: GetPayersInput;
}): Promise<{ payers: BridgePayer[] }> => {
  // we are doing this because bridge API is stupid and returns error for empty query
  if (data.query === '') {
    data.query = ' ';
  }

  return api.post('/insurance/payers', data);
};

export const getPayersQueryOptions = (data: GetPayersInput) => {
  return queryOptions({
    queryKey: ['payers', data.query],
    queryFn: () => getPayers({ data }),
  });
};

type UsePayersOptions = {
  data: GetPayersInput;
  queryConfig?: QueryConfig<typeof getPayersQueryOptions>;
};

export const usePayers = ({ queryConfig, data }: UsePayersOptions) => {
  return useQuery({
    ...getPayersQueryOptions(data),
    ...queryConfig,
  });
};
