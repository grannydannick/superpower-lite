import { COLLECTION_METHODS, type CollectionOptionType } from '@/const';
import { getInterpretedAtHomeMethod } from '@/features/orders/utils/get-interpreted-method';
import { Address, HealthcareService } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

/**
 * Returns a list of collection methods available for the given service and draft order.
 *
 * @param {HealthcareService} service - The healthcare service for which to get the collection methods.
 * @param primaryAddress - Primary address of user
 * @param isAdmin - Whether the user is an admin
 * @param hasAtHomeCredit - Whether the user has an AT_HOME credit from a draft order
 * @returns {CollectionOptionType[]} An array of available collection methods.
 */
export const getCollectionMethods = (
  service: HealthcareService,
  primaryAddress?: Address,
  isAdmin = false,
  hasAtHomeCredit = false,
): CollectionOptionType[] => {
  const state = primaryAddress?.state;
  const INTERPRETED = getInterpretedAtHomeMethod(service, state);

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
    const pricingText = getPricingText(
      inLabOption,
      hasAtHomeCredit,
      'Included',
    );

    return {
      ...inLabOption,
      pricingText,
    };
  };

  // helper
  const createInterpretedOption = (
    overrides: Partial<CollectionOptionType> = {},
  ) => {
    const interpretedOption = { ...INTERPRETED, ...overrides };
    const pricingText = getPricingText(
      interpretedOption,
      hasAtHomeCredit,
      'Prepaid',
    );

    return {
      ...interpretedOption,
      pricingText,
    };
  };

  if (primaryAddress) {
    const state = primaryAddress.state;

    // If user is admin, allow in-lab options regardless of state
    if (isAdmin) {
      return [createInLabOption(), createInterpretedOption()];
    }

    // For NY and NJ, only allow at-home appointments
    if (state === 'NY' || state === 'NJ') {
      return [
        createInLabOption({
          disabled: true,
          description:
            'We currently support at-home appointments only in New York (NY) and New Jersey (NJ).',
        }),
        createInterpretedOption(),
      ];
    }

    // For AZ, only allow at-home appointments
    if (state === 'AZ') {
      return [
        createInLabOption({
          disabled: true,
          description:
            'We currently support at-home appointments only in Arizona (AZ).',
        }),
        createInterpretedOption(),
      ];
    }
  }

  if (!service.supportsLabOrder) {
    return [
      createInLabOption({
        disabled: true,
        description: "This service doesn't support in-lab",
      }),
      createInterpretedOption(),
    ];
  }

  return [createInLabOption(), createInterpretedOption()];
};
