import { CollectionMethodType } from '@/types/api';

export type CollectionOptionType = {
  name: string;
  value: CollectionMethodType;
  description: string;
  cancelationText?: string;
  price: number;
  disabled: boolean;
  pricingText?: string;
};

// States with lower at-home testing price ($99)
const LOWER_PRICED_AT_HOME_COLLECTION_FEE_STATES = new Set<string>([
  'NY',
  'NJ',
  'AZ',
]);

// Pricing constants (in cents)
const AT_HOME_PRICE_LOWER = 9900; // $99 for NY, NJ, AZ
const AT_HOME_PRICE_DEFAULT = 11900; // $119 for all other states

/**
 * Returns the at-home collection price based on the user's state
 * @param state - The user's state code (e.g., 'NY', 'CA', etc.)
 * @returns The price in cents
 */
export const getAtHomePrice = (state?: string): number => {
  if (state && LOWER_PRICED_AT_HOME_COLLECTION_FEE_STATES.has(state)) {
    return AT_HOME_PRICE_LOWER;
  }
  return AT_HOME_PRICE_DEFAULT;
};

export const COLLECTION_METHODS: Record<
  'AT_HOME' | 'IN_LAB',
  CollectionOptionType
> = {
  IN_LAB: {
    name: 'Visit a lab near you',
    value: 'IN_LAB',
    description:
      'Perform testing at a partner clinic. We’ll help you find one close by at a time that works with your schedule.',
    price: 0,
    disabled: false,
  },
  AT_HOME: {
    name: 'Let us come to you',
    value: 'AT_HOME',
    description:
      'A licensed nurse will meet you at home, work, or wherever you are to perform your blood draw.',
    cancelationText: 'Late cancellation or rescheduling fees apply.',
    price: AT_HOME_PRICE_DEFAULT, // Default price, should be overridden with getAtHomePrice(state)
    disabled: false,
  },
} as const;
