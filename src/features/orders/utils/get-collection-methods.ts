import {
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
  ADVANCED_BLOOD_PANEL,
} from '@/const';
import { COLLECTION_METHODS } from '@/features/orders/const/collection-methods';
import { CollectionOptionType } from '@/features/orders/types/collection-method';
import { getInterpretedAtHomeMethod } from '@/features/orders/utils/get-interpreted-method';
import { Address, HealthcareService } from '@/types/api';

/**
 * Returns a list of collection methods available for the given service and draft order.
 *
 * @param {HealthcareService} service - The healthcare service for which to get the collection methods.
 * @param primaryAddress - Primary address of user
 * @param isAdmin - Whether the user is an admin
 * @returns {CollectionOptionType[]} An array of available collection methods.
 */
export const getCollectionMethods = (
  service: HealthcareService,
  primaryAddress?: Address,
  isAdmin = false,
): CollectionOptionType[] => {
  const isBloodPanel =
    service.name === SUPERPOWER_BLOOD_PANEL ||
    service.name === CUSTOM_BLOOD_PANEL ||
    service.name == ADVANCED_BLOOD_PANEL;
  const INTERPRETED = getInterpretedAtHomeMethod(service);

  if (primaryAddress) {
    const state = primaryAddress.state;

    // If user is admin, allow in-lab options regardless of state
    if (isAdmin) {
      return [COLLECTION_METHODS.IN_LAB, INTERPRETED];
    }

    // For NY and NJ, only allow at-home appointments
    if (state === 'NY' || state === 'NJ') {
      return [
        {
          ...COLLECTION_METHODS.IN_LAB,
          disabled: true,
          description:
            'We currently support at-home appointments only in New York (NY) and New Jersey (NJ).',
        },
        INTERPRETED,
      ];
    }
  }

  if (!isBloodPanel) {
    return [
      {
        ...COLLECTION_METHODS.IN_LAB,
        disabled: true,
        description: "This service doesn't support in-lab",
      },
      INTERPRETED,
    ];
  }

  return [COLLECTION_METHODS.IN_LAB, INTERPRETED];
};
