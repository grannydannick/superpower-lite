import {
  COLLECTION_METHODS,
  getAtHomePrice,
  type CollectionOptionType,
} from '@/const';
import { HealthcareService } from '@/types/api';

/**
 * Returns the interpreted 'At Home' collection method based on the service and state.
 *
 * If the service is not a blood panel, the method is adjusted to 'PHLEBOTOMY_KIT'.
 * The price is adjusted based on the user's state.
 *
 * @param {HealthcareService} service - The healthcare service to interpret.
 * @param {string} [state] - The user's state code (e.g., 'NY', 'CA', etc.)
 * @returns {CollectionOptionType} The interpreted 'At Home' collection method.
 */
export const getInterpretedAtHomeMethod = (
  service: HealthcareService,
  state?: string,
): CollectionOptionType => {
  const price = getAtHomePrice(state);

  if (!service.supportsLabOrder) {
    return {
      ...COLLECTION_METHODS.AT_HOME,
      value: 'PHLEBOTOMY_KIT',
    };
  }
  return {
    ...COLLECTION_METHODS.AT_HOME,
    price,
  };
};
