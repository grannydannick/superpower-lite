import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Invoice } from '@/types/api';

export const getInvoice = ({
  invoiceId,
}: {
  invoiceId: string;
}): Promise<{ invoice: Invoice }> => {
  return api.get(`/billing/invoices/${invoiceId}`);
};

export const getInvoiceQueryOptions = (invoiceId: string) => {
  return queryOptions({
    queryKey: ['invoices', invoiceId],
    queryFn: () => getInvoice({ invoiceId }),
  });
};

type UseInvoiceOptions = {
  invoiceId: string;
  queryConfig?: QueryConfig<typeof getInvoiceQueryOptions>;
};

export const useInvoice = ({ invoiceId, queryConfig }: UseInvoiceOptions) => {
  return useQuery({
    ...getInvoiceQueryOptions(invoiceId),
    ...queryConfig,
  });
};
