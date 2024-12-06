import {
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  SUPERPOWER_BLOOD_PANEL,
} from '@/const';
import { COLLECTION_METHODS } from '@/features/orders/const/collection-methods';
import { CollectionOptionType } from '@/features/orders/types/collection-method';
import { HealthcareService } from '@/types/api';

/**
 * Returns the interpreted 'At Home' collection method based on the service.
 *
 * If the service is not a blood panel, the method is adjusted to 'PHLEBOTOMY_KIT'.
 *
 * @param {HealthcareService} service - The healthcare service to interpret.
 * @returns {CollectionOptionType} The interpreted 'At Home' collection method.
 */
export const getInterpretedAtHomeMethod = (
  service: HealthcareService,
): CollectionOptionType => {
  const isBloodPanel =
    service.name === SUPERPOWER_BLOOD_PANEL ||
    service.name === CUSTOM_BLOOD_PANEL ||
    service.name == ADVANCED_BLOOD_PANEL;

  if (!isBloodPanel) {
    return {
      ...COLLECTION_METHODS.AT_HOME,
      value: 'PHLEBOTOMY_KIT',
    };
  }
  return COLLECTION_METHODS.AT_HOME;
};
