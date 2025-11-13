import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { RxService } from '@/types/api';

export const getRx = (): Promise<RxService[]> => {
  return api.get(`/rx/rx-catalogs`);
};

export const getRxQueryOptions = () => {
  return queryOptions({
    queryKey: ['rx'],
    queryFn: () => getRx(),
  });
};

type UseRxOptions = {
  queryConfig?: QueryConfig<typeof getRxQueryOptions>;
};

export const useRx = ({ queryConfig }: UseRxOptions = {}) => {
  return useQuery({
    ...getRxQueryOptions(),
    ...queryConfig,
  });
};
