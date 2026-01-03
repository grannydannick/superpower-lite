import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { HealthcareService, ServiceGroup } from '@/types/api';

export const getServices = async ({
  group,
  includeUnorderable,
}: {
  group?: ServiceGroup;
  includeUnorderable?: boolean;
}): Promise<{
  services: HealthcareService[];
}> => {
  const params: Record<string, string> = {};

  if (group) {
    params.group = group;
  }

  if (includeUnorderable) {
    params.includeUnorderable = 'true';
  }

  return await api.get('/services', { params });
};

export const getServicesQueryOptions = ({
  group,
  includeUnorderable,
}: {
  group?: ServiceGroup;
  includeUnorderable?: boolean;
} = {}) => {
  return queryOptions({
    queryKey: ['services', group, includeUnorderable],
    queryFn: () => getServices({ group, includeUnorderable }),
    // this is on purpose to remove issues with credits / etc
    // added oct 7, 2025 by NM
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });
};

type UseServicesOptions = {
  group?: ServiceGroup;
  includeUnorderable?: boolean;
  queryConfig?: QueryConfig<typeof getServicesQueryOptions>;
};

export const useServices = ({
  queryConfig,
  group,
  includeUnorderable,
}: UseServicesOptions = {}) => {
  return useQuery({
    ...getServicesQueryOptions({ group, includeUnorderable }),
    ...queryConfig,
  });
};
