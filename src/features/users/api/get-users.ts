import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { AdminUser } from '@/types/api';

export const getUsers = (search?: string): Promise<{ users: AdminUser[] }> => {
  const queryParams = new URLSearchParams();

  if (search) {
    queryParams.append('search', search);
  }

  const queryString = queryParams.toString();

  return api.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
};

export const getUsersQueryOptions = (search?: string) => {
  return queryOptions({
    queryKey: ['users', search],
    queryFn: () => getUsers(search),
  });
};

type UseUsersOptions = {
  search?: string;
  queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useUsers = ({ queryConfig, search }: UseUsersOptions = {}) => {
  return useQuery({
    ...getUsersQueryOptions(search),
    ...queryConfig,
  });
};
