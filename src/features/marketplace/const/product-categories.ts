import type { ComponentType, SVGProps } from 'react';

import { Tests } from '@/components/icons/marketplace';
import { Prescriptions } from '@/components/icons/marketplace/prescriptions';

export const PRODUCT_CATEGORIES = ['prescriptions', 'tests'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const DEFAULT_CATEGORY = PRODUCT_CATEGORIES[0];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  prescriptions: 'Prescriptions',
  tests: 'Tests',
};

export const CATEGORY_ICONS: Record<
  ProductCategory,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  prescriptions: Prescriptions,
  tests: Tests,
};
