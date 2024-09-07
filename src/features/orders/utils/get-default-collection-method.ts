import {
  ADVISORY_CALL,
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { CollectionMethodType, HealthcareService } from '@/types/api';

/**
 * Determines the default collection method for a healthcare service.
 *
 * @param {HealthcareService} service - The healthcare service object that contains details such as name and phlebotomy requirements.
 * @returns {CollectionMethodType | null} The default collection method type, or `null` if none is applicable.
 *
 * @example
 * // Returns 'IN_LAB'
 * const collectionMethod = getDefaultCollectionMethod({
 *   name: 'Superpower Blood Panel',
 * });
 *
 * // Returns null for advisory calls
 * const collectionMethod = getDefaultCollectionMethod({
 *   name: 'Advisory Call',
 * });
 */
export const getDefaultCollectionMethod = (
  service: HealthcareService,
): CollectionMethodType | null => {
  const isPhlebotomy = service.phlebotomy;
  const isBloodPanel =
    service.name === SUPERPOWER_BLOOD_PANEL ||
    service.name === CUSTOM_BLOOD_PANEL;

  /*
   * Extend with more services if needed
   * */
  if (service.name === ADVISORY_CALL) {
    return null;
  }

  if (!isBloodPanel && service.phlebotomy) {
    return 'PHLEBOTOMY_KIT';
  }

  return isPhlebotomy && isBloodPanel ? 'IN_LAB' : 'AT_HOME';
};
