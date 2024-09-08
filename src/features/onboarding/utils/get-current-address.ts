import { GUT_MICROBIOME_ANALYSIS, TOTAL_TOXIN_TEST } from '@/const';
import { ScheduledSlots } from '@/features/onboarding/stores/onboarding-store';
import { HealthcareService } from '@/types/api';

export const getCurrentAddress = (
  service: HealthcareService,
  slots: ScheduledSlots,
) => {
  switch (service.name) {
    case TOTAL_TOXIN_TEST:
      return slots.toxin.address;
    case GUT_MICROBIOME_ANALYSIS:
      return slots.microbiome.address;
    default:
      return null;
  }
};
