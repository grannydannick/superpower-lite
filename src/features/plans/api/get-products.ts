import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Product } from '@/types/api';

export const getProducts = (): Promise<{ products: Product[] }> => {
  return api.get(`/shop/products`);
};

export const getProductsQueryOptions = () => {
  return queryOptions({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });
};

type UseProductsOptions = {
  queryConfig?: QueryConfig<typeof getProductsQueryOptions>;
};

export const useProducts = ({ queryConfig }: UseProductsOptions) => {
  return useQuery({
    ...getProductsQueryOptions(),
    ...queryConfig,
  });
};
