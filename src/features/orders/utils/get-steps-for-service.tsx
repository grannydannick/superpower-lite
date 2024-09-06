import { StepItem } from '@/components/ui/stepper';
import {
  ADVISORY_CALL,
  CONTINUOUS_GLUCOSE_MONITOR,
  CUSTOM_BLOOD_PANEL,
  DEXA_SCAN,
  ENVIRONMENTAL_TOXINS,
  FOOD_ENVIRENMENTAL_ALLERGY,
  FULL_BODY_MRI,
  FULL_GENETIC_SEQUENCING,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  HEART_CALCIUM_SCAN,
  INTESTINAL_PERMEABILITY_PANEL,
  PFAS_CHEMICALS,
  SUPERPOWER_BLOOD_PANEL,
  VO2_MAX_TEST,
} from '@/const';
import { Calendly } from '@/features/orders/components/steps/calendly';
import { Disclaimer } from '@/features/orders/components/steps/disclaimer';
import { MessageConcierge } from '@/features/orders/components/steps/message-concierge';
import { PhlebotomyLocationSelect } from '@/features/orders/components/steps/phlebotomy-location';
import { PhlebotomyScheduler } from '@/features/orders/components/steps/phlebotomy-scheduler';
import { EarlyAccessContent } from '@/features/orders/components/steps/request-early-access';
import { HealthcareServiceDetails } from '@/features/orders/components/steps/service-details';
import { Success } from '@/features/orders/components/steps/success';
import { OrderSummary } from '@/features/orders/components/steps/summary';
import { ToxinsSelect } from '@/features/orders/components/steps/toxins-select';
import { HealthcareService } from '@/types/api';

/**
 * Retrieves the steps required for scheduling based on the healthcare service provided.
 * This function returns an array of steps (`StepItem[]`) specific to the given healthcare service.
 *
 * @param {HealthcareService} healthcareService - The healthcare service for which to retrieve steps.
 * @param dataLink tells us if there is assigned RDN to this user
 * @returns {StepItem[]} An array of steps required for the given healthcare service.
 */
export const getStepsFromService = (
  healthcareService: HealthcareService,
  dataLink?: string,
): StepItem[] => {
  switch (healthcareService.name) {
    case SUPERPOWER_BLOOD_PANEL:
      return [
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'phlebotomy', content: <PhlebotomyLocationSelect /> },
        { id: 'scheduler', content: <PhlebotomyScheduler /> },
        { id: 'summary', content: <OrderSummary /> },
        { id: 'success', content: <Success /> },
      ];
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return [
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'disclaimer', content: <Disclaimer /> },
        { id: 'phlebotomy', content: <PhlebotomyLocationSelect /> },
        { id: 'scheduler', content: <PhlebotomyScheduler /> },
        { id: 'summary', content: <OrderSummary /> },
        { id: 'success', content: <Success /> },
      ];
    case ENVIRONMENTAL_TOXINS:
      return [
        { id: 'disclaimer', content: <Disclaimer /> },
        { id: 'toxin-select', content: <ToxinsSelect /> },
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'summary', content: <OrderSummary /> },
        { id: 'success', content: <Success /> },
      ];
    case CONTINUOUS_GLUCOSE_MONITOR:
      return [
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'summary', content: <OrderSummary /> },
        { id: 'success', content: <Success /> },
      ];
    case FULL_BODY_MRI:
    case VO2_MAX_TEST:
    case DEXA_SCAN:
    case HEART_CALCIUM_SCAN:
    case GUT_MICROBIOME_ANALYSIS:
    case FULL_GENETIC_SEQUENCING:
      return [
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'concierge', content: <MessageConcierge /> },
      ];
    // TODO: write dynamic function to check if service is active or not and push appropriate steps
    case PFAS_CHEMICALS:
    case INTESTINAL_PERMEABILITY_PANEL:
    case FOOD_ENVIRENMENTAL_ALLERGY:
    case CUSTOM_BLOOD_PANEL:
      return [{ id: 'early-access', content: <EarlyAccessContent /> }];
    case ADVISORY_CALL: {
      if (dataLink && dataLink !== '') {
        return [
          { id: 'info', content: <HealthcareServiceDetails /> },
          { id: 'summary', content: <OrderSummary /> },
          { id: 'calendly', content: <Calendly /> },
          { id: 'success', content: <Success /> },
        ];
      }

      return [{ id: 'early-access', content: <EarlyAccessContent /> }];
    }
    default:
      return [];
  }
};
