import { CollectionMethodType, HealthcareService } from '@/types/api';

export const getDefaultCollectionMethod = (
  service: HealthcareService,
): CollectionMethodType | null => {
  const isPhlebotomy = service.phlebotomy;
  const isBloodPanel =
    service.name === 'Superpower Blood Panel' ||
    service.name === 'Custom Blood Panel';

  // TODO: potentially add other service that doesn't need collection methods
  if (service.name === '1-1 Advisory Call') {
    return null;
  }

  if (!isBloodPanel && service.phlebotomy) {
    return 'PHLEBOTOMY_KIT';
  }

  return isPhlebotomy && isBloodPanel ? 'IN_LAB' : 'AT_HOME';
};
