import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { User } from '@/types/api';

export const getRdnPatients = (): Promise<{ patients: User[] }> => {
  return api.get('/rdns/patients');
};

export const getRdnPatientsQueryOptions = () => {
  return queryOptions({
    queryKey: ['get-rdn-patients'],
    queryFn: () => getRdnPatients(),
  });
};

type UseRdnPatientsOptions = {
  queryConfig?: QueryConfig<typeof getRdnPatientsQueryOptions>;
};

export const useRdnPatients = ({ queryConfig }: UseRdnPatientsOptions = {}) => {
  return useQuery({
    ...getRdnPatientsQueryOptions(),
    ...queryConfig,
  });
};
