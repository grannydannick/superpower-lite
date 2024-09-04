import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Invoice } from '@/types/api';

export const getInvoices = (): Promise<{ invoices: Invoice[] }> => {
  return api.get('/billing/invoices');
};

export const getInvoicesQueryOptions = () => {
  return queryOptions({
    queryKey: ['invoices'],
    queryFn: () => getInvoices(),
  });
};

type UseInvoicesOptions = {
  queryConfig?: QueryConfig<typeof getInvoicesQueryOptions>;
};

export const useInvoices = ({ queryConfig }: UseInvoicesOptions = {}) => {
  return useQuery({
    ...getInvoicesQueryOptions(),
    ...queryConfig,
  });
};
