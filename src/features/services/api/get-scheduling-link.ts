import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';

export const getSchedulingLink = async (): Promise<{
  link: string;
}> => {
  return api.get('/rdns/link');
};

export const getSchedylingLinkQueryOptions = () => {
  return queryOptions({
    queryKey: ['rdnLink'],
    queryFn: () => getSchedulingLink(),
  });
};

type UseGetSchedulingLinkOptions = {
  queryConfig?: QueryConfig<typeof getSchedylingLinkQueryOptions>;
};

export const useGetSchedulingLink = ({
  queryConfig,
}: UseGetSchedulingLinkOptions = {}) => {
  return useQuery({
    ...getSchedylingLinkQueryOptions(),
    ...queryConfig,
  });
};
