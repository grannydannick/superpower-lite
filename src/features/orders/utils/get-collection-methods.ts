import {
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
  ADVANCED_BLOOD_PANEL,
} from '@/const';
import { COLLECTION_METHODS } from '@/features/orders/const/collection-methods';
import { CollectionOptionType } from '@/features/orders/types/collection-method';
import { getInterpretedAtHomeMethod } from '@/features/orders/utils/get-interpreted-method';
import { HealthcareService } from '@/types/api';

/**
 * Returns a list of collection methods available for the given service and draft order.
 *
 * @param {HealthcareService} service - The healthcare service for which to get the collection methods.
 * @returns {CollectionOptionType[]} An array of available collection methods.
 */
export const getCollectionMethods = (
  service: HealthcareService,
): CollectionOptionType[] => {
  const isBloodPanel =
    service.name === SUPERPOWER_BLOOD_PANEL ||
    service.name === CUSTOM_BLOOD_PANEL ||
    service.name == ADVANCED_BLOOD_PANEL;
  const INTERPRETED = getInterpretedAtHomeMethod(service);

  if (!isBloodPanel) {
    return [INTERPRETED];
  }

  return [COLLECTION_METHODS.IN_LAB, INTERPRETED];
};
