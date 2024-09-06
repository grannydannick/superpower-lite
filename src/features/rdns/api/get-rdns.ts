import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Rdn } from '@/types/api';

export const getRdns = (): Promise<{ rdns: Rdn[] }> => {
  return api.get('/admin/rdns');
};

export const getRdnsQueryOptions = () => {
  return queryOptions({
    queryKey: ['rdn'],
    queryFn: () => getRdns(),
  });
};

type UseRdnsOptions = {
  queryConfig?: QueryConfig<typeof getRdnsQueryOptions>;
};

export const useRdns = ({ queryConfig }: UseRdnsOptions = {}) => {
  return useQuery({
    ...getRdnsQueryOptions(),
    ...queryConfig,
  });
};
