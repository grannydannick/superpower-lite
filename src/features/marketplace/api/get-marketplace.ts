import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import {
  HealthcareService,
  Marketplace,
  MarketplaceApiResponse,
  MarketplaceData,
  Product,
  Rx,
} from '@/types/api';

const toProduct = (product: Marketplace): Product => {
  return {
    id: product.id,
    name: product.name,
    price: product.price ?? 0,
    url: product.url ?? '',
    discount: product.discount ?? 0,
    type: product.type ?? undefined,
    image: product.image ?? undefined,
    additionalClassification: product.additionalClassification ?? [],
    vendor: product.vendor ?? undefined,
  };
};

const toRx = (product: Marketplace): Rx => {
  return {
    id: product.id,
    url: product.url,
    type: product.type,
    name: product.name,
    description: product.description,
    price: product.price,
    active: product.active,
    additionalClassification: product.additionalClassification,
  };
};

const toHealthcareService = (product: Marketplace): HealthcareService => {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    price: product.price ?? 0,
    active: product.active ?? true,
    additionalClassification: product.additionalClassification ?? [],
    phlebotomy: product.phlebotomy ?? false,
    supportsLabOrder: product.supportsLabOrder ?? false,
    bloodTubeCount: product.bloodTubeCount ?? 0,
  };
};

export const getMarketplace = async (): Promise<MarketplaceData> => {
  const response = (await api.get(
    '/products?hasTags=true',
  )) as MarketplaceApiResponse;

  return {
    supplements: response.supplements.map(toProduct),
    prescriptions: response.prescriptions.map(toRx),
    services: response.services.map(toHealthcareService),
  };
};

export const getMarketplaceQueryOptions = () => {
  return queryOptions({
    queryKey: ['marketplace-products'],
    queryFn: () => getMarketplace(),
  });
};

type UseMarketplaceOptions = {
  queryConfig?: QueryConfig<typeof getMarketplaceQueryOptions>;
};

export const useMarketplace = ({ queryConfig }: UseMarketplaceOptions = {}) => {
  return useQuery({
    ...getMarketplaceQueryOptions(),
    ...queryConfig,
  });
};
