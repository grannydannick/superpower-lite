import { CarePlanActivity } from '@medplum/fhirtypes';
import { useMemo } from 'react';

import { CARE_PLAN_ACTIVITY_TYPE_EXTENSION } from '@/features/plans/const/extension-types';
import { useProducts } from '@/features/shop/api';
import { Product } from '@/types/api';

import { calculateTotals } from '../utils/calculate-totals';

type UseBundleResult = {
  products: Product[];
  total: number;
  totalSavings: number;
  name: string;
  description: string;
};

/**
 * useBundle
 *
 * Encapsulates business logic for computing a bundle from linked product activities.
 * - Excludes prescription activities (rx-experimental) from bundle totals
 * - Maps activity codings to Product entities from the shop API
 * - Computes total and total savings using shared utilities
 * - Provides a stable name/description for the bundle
 */
export function useBundle(
  activities: CarePlanActivity[] = [],
): UseBundleResult {
  const { data: productsData } = useProducts({});

  const products = useMemo(() => {
    if (!activities?.length) return [] as Product[];

    const items = activities
      .map((activity) => {
        const productCoding =
          activity.detail?.productCodeableConcept?.coding?.[0];
        const activityType = activity.detail?.extension?.find(
          (ext) => ext.url === CARE_PLAN_ACTIVITY_TYPE_EXTENSION,
        )?.valueString;

        if (activityType === 'rx-experimental') return undefined;
        if (!productCoding) return undefined;

        return productsData?.products?.find((p) => p.id === productCoding.code);
      })
      .filter(Boolean) as Product[];

    return items;
  }, [activities, productsData?.products]);

  const { total, totalSavings } = useMemo(
    () => calculateTotals(products),
    [products],
  );

  return {
    products,
    total,
    totalSavings,
    name: 'Your personal bundle',
    description: 'Everything you need to address your issues.',
  };
}
