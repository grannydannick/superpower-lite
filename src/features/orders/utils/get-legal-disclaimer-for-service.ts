import { ENVIRONMENTAL_TOXINS, GRAIL_GALLERI_MULTI_CANCER_TEST } from '@/const';
import { LEGAL_DESCLAIMERS } from '@/features/orders/const/legal-desclaimers';
import { HealthcareService } from '@/types/api';

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
