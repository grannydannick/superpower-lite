import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { HealthcareService } from '@/types/api';

export const getServices = async (): Promise<{
  services: HealthcareService[];
}> => {
  return await api.get('/services');
};

export const getServicesQueryOptions = () => {
  return queryOptions({
    queryKey: ['services'],
    queryFn: () => getServices(),
  });
};

type UseServicesOptions = {
  queryConfig?: QueryConfig<typeof getServicesQueryOptions>;
};

export const useServices = ({ queryConfig }: UseServicesOptions = {}) => {
  return useQuery({
    ...getServicesQueryOptions(),
    ...queryConfig,
  });
};
