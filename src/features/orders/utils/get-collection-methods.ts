import {
  COLLECTION_METHODS,
  getAtHomePrice,
  type CollectionOptionType,
} from '@/const';
import { Address, HealthcareService, Order } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

/**
 * Returns a list of collection methods available for the given service and draft order.
 *
 * @param {HealthcareService} service - The healthcare service for which to get the collection methods.
 * @param primaryAddress - Primary address of user
 * @param isAdmin - Whether the user is an admin
 * @param credit - Existing credit
 * @returns {CollectionOptionType[]} An array of available collection methods.
 */
export const getCollectionMethods = (
  service: HealthcareService,
  primaryAddress?: Address,
  credit?: Order,
  isAdmin = false,
): CollectionOptionType[] => {
  // helper to compute pricing text with customizable credit label
  const getPricingText = (
    option: CollectionOptionType,
    hasCredit: boolean,
    creditText: string,
  ): string | undefined => {
    if (option.disabled) return 'Not available';
    if (option.price === 0) return undefined;
    if (hasCredit) return creditText;

    return `+${formatMoney(option.price)}`;
  };

  // helper function to create collection method options with proper pricing
  const createInLabOption = (overrides: Partial<CollectionOptionType> = {}) => {
    const inLabOption = { ...COLLECTION_METHODS.IN_LAB, ...overrides };
    const pricingText = getPricingText(inLabOption, !!credit, 'Included');

    return {
      ...inLabOption,
      pricingText,
    };
  };

  // helper
  const createAtHomedOption = (
    overrides: Partial<CollectionOptionType> = {},
  ) => {
    const atHomeOption = { ...COLLECTION_METHODS.AT_HOME, ...overrides };

    const pricingText = getPricingText(
      atHomeOption,
      credit?.collectionMethod === 'AT_HOME',
      'Prepaid',
    );

    return {
      ...atHomeOption,
      pricingText,
    };
  };

  if (!primaryAddress?.state) {
    return [];
  }

  const state = primaryAddress.state;
  const atHomePrice = getAtHomePrice(state);

  // If user is admin, allow in-lab options regardless of state
  if (isAdmin) {
    return [createInLabOption(), createAtHomedOption({ price: atHomePrice })];
  }

  if (!service.supportsLabOrder) {
    return [
      createInLabOption({
        disabled: true,
        description: "This service doesn't support in-lab",
      }),
      createAtHomedOption({ price: atHomePrice }),
    ];
  }

  return [createInLabOption(), createAtHomedOption({ price: atHomePrice })];
};
