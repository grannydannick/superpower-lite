import React from 'react';

import { useMarketplace } from '@/features/marketplace/api/get-marketplace';
import { usePlans } from '@/features/protocol/api';
import { parseProductRequests } from '@/features/protocol/utils/parse-product-requests';
import { Product } from '@/types/api';

/**
 * Decide on the products to recommend based on the products available and the care plan requests
 * @param products
 * @param carePlanRequests
 * @returns
 */
const getProducts = (
  /**
   * All products available in the shop (~500 items at the time of writing)
   */
  availableProducts: Product[],
  /**
   * Product ids requested by the care plan
   */
  carePlanRequests?: string[],
  /**
   * Number of products to return (default: 4)
   */
  n: number = 4,
) => {
  // compile maps for quick lookup
  const productIdMap = new Map<string, Product>();
  const productNameMap = new Map<string, Product>();

  for (const product of availableProducts) {
    productIdMap.set(product.id, product);
    productNameMap.set(product.name.toLowerCase(), product);
  }

  const fallbackProducts = [
    'Magnesium Glycinate',
    'O.N.E Omega-3',
    'MegaQuin K2 + D3',
    'NAC - N-Acetylcysteine',
    'Basic Nutrients 2/Day',
    // further fallbacks
    'Vitamin A',
    'Vitamin C',
    'Omega-3',
    'Ginger Extract',
  ];

  const products: Product[] = [];

  // prioritize care plan requests
  for (const productId of carePlanRequests ?? []) {
    const product = productIdMap.get(productId);
    if (product) {
      products.push(product);
    }
    if (products.length >= n) break;
  }

  // fill in with fallbacks if needed
  if (products.length < n) {
    for (const fallbackName of fallbackProducts) {
      const product = productNameMap.get(fallbackName.toLowerCase());
      if (product && !products.find((p) => p.id === product.id)) {
        products.push(product);
      }
      if (products.length >= n) break;
    }
  }

  // fill in with first available products if still needed
  if (products.length < n) {
    for (const product of availableProducts) {
      products.push(product);
      if (products.length >= n) break;
    }
  }

  return products;
};

export const useProductRecommendations = () => {
  const plans = usePlans();

  const plan = React.useMemo(() => {
    // get the most recent completed action plan with product requests
    const actionPlans = (plans.data?.actionPlans ?? []).filter(
      (p) =>
        p.status === 'completed' &&
        parseProductRequests(p.activity ?? []).length > 0,
    );

    return actionPlans[0];
  }, [plans.data?.actionPlans]);

  const { data: productsData, isLoading: isProductsLoading } = useMarketplace();

  const recommendedProducts = React.useMemo(() => {
    return getProducts(
      productsData?.supplements ?? [],
      parseProductRequests(plan?.activity ?? []),
    );
  }, [plan, productsData?.supplements]);

  const isLoading = plans.isLoading || isProductsLoading;

  return {
    recommendedProducts,
    plan,
    isLoading,
  };
};
