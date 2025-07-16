import { useCarePlan } from '@/features/plans/context/care-plan-context';
import { parseProductRequests } from '@/features/plans/utils/parse-product-requests';
import { useProducts } from '@/features/shop/api';

interface ProductAvailabilityResult {
  productRequests: string[];
  availableProductCount: number;
  unavailableProductCount: number;
  productCount: number;
  hasProducts: boolean;
  hasAvailableProducts: boolean;
}

/**
 * Hook to calculate product availability and counts from a care plan
 *
 * This hook extracts product IDs from care plan activities and checks their availability
 * against the products API data. It provides convenient boolean flags and counts for
 * conditional rendering and display purposes.
 *
 * @returns Object containing:
 *   - productRequests: Array of product IDs from the care plan
 *   - availableProductCount: Number of products that exist in the products API
 *   - unavailableProductCount: Number of products that don't exist in the products API
 *   - productCount: Total number of product requests
 *   - hasProducts: Whether there are any product requests
 *   - hasAvailableProducts: Whether there are any available products
 * @throws Error if used outside of CarePlanProvider
 */
export function useProductAvailability(): ProductAvailabilityResult {
  const { plan } = useCarePlan();
  const { data: productsData } = useProducts({});

  const productRequests = parseProductRequests(plan.activity ?? []);

  const hasProducts = Boolean(
    plan.activity && plan.activity.length > 0 && productRequests.length > 0,
  );

  const availableProductCount = productRequests.reduce((count, productId) => {
    const productExists = productsData?.products?.some(
      (p) => p.id === productId,
    );
    return productExists ? count + 1 : count;
  }, 0);

  const hasAvailableProducts = availableProductCount > 0;
  const productCount = productRequests.length;
  const unavailableProductCount = productCount - availableProductCount;

  return {
    productRequests,
    availableProductCount,
    unavailableProductCount,
    productCount,
    hasProducts,
    hasAvailableProducts,
  };
}
