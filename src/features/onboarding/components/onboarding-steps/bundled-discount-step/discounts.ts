import { User } from '@/types/api';

const BUNDLED_DISCOUNTS = [
  {
    id: 'add-1-test',
    title: 'Add 1 test',
    quantity: 1,
    pricing: {
      GET_LABS: {
        price: 29900,
        originalPrice: 39900,
      },
      DEFAULT: {
        price: 15900,
        originalPrice: 19900,
      },
    },
    descriptionItems: [
      'Great for members just starting their health journey or checking in once more this year.',
      "We'll let you know when it's time to retest and update your plan based on new results.",
    ],
    image: '/onboarding/upgrade/test-tube.webp',
  },
  {
    id: 'add-3-tests',
    title: 'Add 3 tests',
    quantity: 3,
    pricing: {
      GET_LABS: {
        price: 87700,
        originalPrice: 119700,
      },
      DEFAULT: {
        price: 38700,
        originalPrice: 59700,
      },
    },
    descriptionItems: [
      'Best for members focused on consistent progress and deeper insights over time.',
      'Every test provides a new action plan that builds on your past results with updated guidance and recommendations.',
    ],
    image: '/onboarding/upgrade/test-tubes.webp',
  },
] as const;

export interface BundledDiscountPricing {
  price: number;
  originalPrice: number;
}

export interface BundledDiscountPricingOptions {
  GET_LABS: BundledDiscountPricing;
  DEFAULT: BundledDiscountPricing;
}

export interface BundledDiscount {
  id: string;
  title: string;
  quantity: number;
  pricing: BundledDiscountPricingOptions;
  descriptionItems: readonly string[];
  image: string;
}

export type BundledDiscounts = readonly BundledDiscount[];

export { BUNDLED_DISCOUNTS };

export const getPricingForUser = (
  bundledDiscount: BundledDiscount,
  user?: User,
): BundledDiscountPricing => {
  if (
    user?.primaryAddress?.state === 'NY' ||
    user?.primaryAddress?.state === 'NJ'
  ) {
    return bundledDiscount.pricing.GET_LABS;
  }
  return bundledDiscount.pricing.DEFAULT;
};
