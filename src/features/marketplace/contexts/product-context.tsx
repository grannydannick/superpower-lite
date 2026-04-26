import React, { createContext, useContext } from 'react';

import {
  MarketplaceProduct,
  MarketplaceProductQuery,
  useMarketplaceProduct,
} from '../api/marketplace-products';

type ProductContextValue = {
  slug: string;
  query: MarketplaceProductQuery;
  product: MarketplaceProduct | null;
};

export const ProductContext = createContext<ProductContextValue | null>(null);

type ProductProviderProps = { slug: string; children: React.ReactNode };

export function ProductProvider({ slug, children }: ProductProviderProps) {
  const productQuery = useMarketplaceProduct(slug);

  const product = React.useMemo(
    () => productQuery.data ?? null,
    [productQuery.data],
  );

  return (
    <ProductContext.Provider
      value={{
        slug,
        query: productQuery,
        product,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct(options: {
  optional: true;
}): ProductContextValue | null;
export function useProduct(options?: { optional?: false }): ProductContextValue;
export function useProduct(options?: {
  optional?: boolean;
}): ProductContextValue | null {
  const ctx = useContext(ProductContext);
  if (!ctx && !options?.optional)
    throw new Error('useProduct must be used within ProductProvider');
  return ctx;
}
