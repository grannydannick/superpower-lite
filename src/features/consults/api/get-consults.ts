import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { BookingSummary } from '@/types/api';

export const getConsults = (): Promise<{
  bookings: BookingSummary[];
}> => {
  return api.get('/consults/cal/bookings');
};

export const getConsultsQueryOptions = () => {
  return queryOptions({
    queryKey: ['consults'],
    queryFn: () => getConsults(),
  });
};

type UseConsultsOptions = {
  queryConfig?: QueryConfig<typeof getConsultsQueryOptions>;
};

export const useConsults = ({ queryConfig }: UseConsultsOptions = {}) => {
  return useQuery({
    ...getConsultsQueryOptions(),
    ...queryConfig,
  });
};
