import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Product } from '@/types/api';

export const getProducts = (
  page = 1,
): Promise<{
  products: Product[];
}> => {
  return api.get(`/shop/products`, {
    params: {
      page,
    },
  });
};

export const getProductsQueryOptions = ({ page }: { page?: number } = {}) => {
  return queryOptions({
    queryKey: page ? ['products', { page }] : ['products'],
    queryFn: () => getProducts(page),
  });
};

type UseProductsOptions = {
  page?: number;
  queryConfig?: QueryConfig<typeof getProductsQueryOptions>;
};

export const useProducts = ({ queryConfig, page }: UseProductsOptions = {}) => {
  return useQuery({
    ...getProductsQueryOptions({ page }),
    ...queryConfig,
  });
};
