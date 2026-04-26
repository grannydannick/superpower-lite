import type { ComponentType, SVGProps } from 'react';

import { AllProducts, Tests } from '@/components/icons/marketplace';
import { Prescriptions } from '@/components/icons/marketplace/prescriptions';

export const PRODUCT_CATEGORIES = ['all', 'tests', 'prescriptions'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  all: 'All Products',
  tests: 'Tests',
  prescriptions: 'Prescriptions',
};

export const CATEGORY_ICONS: Record<
  ProductCategory,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  all: AllProducts,
  tests: Tests,
  prescriptions: Prescriptions,
};
