import { ENVIRONMENTAL_TOXINS, GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import { LEGAL_DESCLAIMERS } from '@/features/orders/const/legal-desclaimers';
import { HealthcareService } from '@/types/api';

/**
 * Retrieves the legal disclaimer for a specific healthcare service.
 * If the service does not have a specific disclaimer, the disclaimer for environmental toxins is used by default.
 *
 * @param {HealthcareService} healthcareService - The healthcare service object that contains the service name.
 * @returns {string} The corresponding legal disclaimer for the given healthcare service.
 *
 * The function includes a default case where the disclaimer for "environmental toxins" is returned.
 * This default is applied when the healthcare service does not have a predefined legal disclaimer or falls under unspecified services.
 * This ensures that all services have a disclaimer, especially when the service is not explicitly mapped to one.
 *
 * @example
 * // Returns the legal disclaimer for GRAIL Galleri Multi-Cancer Test
 * const disclaimer = getLegalDisclaimerForService({
 *   name: 'GRAIL Galleri Multi-Cancer Test'
 * });
 *
 * // Returns the default legal disclaimer for environmental toxins
 * const disclaimer = getLegalDisclaimerForService({
 *   name: 'Unspecified Service'
 * });
 */
export const getLegalDisclaimerForService = (
  healthcareService: HealthcareService,
): string => {
  switch (healthcareService.name) {
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return LEGAL_DESCLAIMERS.grail;
    case ENVIRONMENTAL_TOXINS:
      return LEGAL_DESCLAIMERS.environmentalToxins;
    default:
      return LEGAL_DESCLAIMERS.environmentalToxins;
  }
};
