import { ADVISORY_CALL, GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import { CollectionMethodType, HealthcareService } from '@/types/api';

/**
 * Determines if a service should automatically use the user's primary address
 * for scheduling appointments.
 */
export const shouldUsePrimaryAddress = (
  service: HealthcareService,
  collectionMethod: CollectionMethodType | null,
): boolean => {
  const isAdvisoryCall = service.name === ADVISORY_CALL;
  const isGrailGalleri = service.name === GRAIL_GALLERI_MULTI_CANCER_TEST;
  const isAtHomeCollection = collectionMethod === 'AT_HOME';

  return isAdvisoryCall || (isGrailGalleri && isAtHomeCollection);
};
