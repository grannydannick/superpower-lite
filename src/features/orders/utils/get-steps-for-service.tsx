import {
  ADVISORY_CALL,
  CONTINUOUS_GLUCOSE_MONITOR,
  CUSTOM_BLOOD_PANEL,
  DEXA_SCAN,
  ENVIRONMENTAL_TOXIN_TEST,
  ENVIRONMENTAL_TOXINS,
  FOOD_ENVIRENMENTAL_ALLERGY,
  FULL_BODY_MRI,
  FULL_GENETIC_SEQUENCING,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  HEART_CALCIUM_SCAN,
  HEAVY_METALS_TEST,
  INTESTINAL_PERMEABILITY_PANEL,
  MYCOTOXINS_TEST,
  PFAS_CHEMICALS,
  SUPERPOWER_BLOOD_PANEL,
  TOTAL_TOXIN_TEST,
  VO2_MAX_TEST,
} from '@/const';
import { Calendly } from '@/features/orders/components/steps/calendly';
import { ConfirmAddress } from '@/features/orders/components/steps/confirm-address';
import { InformedConsent } from '@/features/orders/components/steps/informed-consent';
import { MessageConcierge } from '@/features/orders/components/steps/message-concierge';
import { PhlebotomyLocationSelect } from '@/features/orders/components/steps/phlebotomy-location';
import { PhlebotomyScheduler } from '@/features/orders/components/steps/phlebotomy-scheduler';
import { EarlyAccessContent } from '@/features/orders/components/steps/request-early-access';
import { HealthcareServiceDetails } from '@/features/orders/components/steps/service-details';
import { Success } from '@/features/orders/components/steps/success';
import { OrderSummary } from '@/features/orders/components/steps/summary';
import { ToxinsSelect } from '@/features/orders/components/steps/toxins-select';
import { StepItem } from '@/lib/stepper';
import { HealthcareService } from '@/types/api';

/**
 * Retrieves the steps required for scheduling based on the healthcare service provided.
 * This function returns an array of steps (`StepItem[]`) specific to the given healthcare service.
 *
 * @param {HealthcareService} healthcareService - The healthcare service for which to retrieve steps.
 * @param dataLink tells us if there is assigned RDN to this user
 * @param draftOrderId tells us if service was already booked and we need to drop some steps
 * @returns {StepItem[]} An array of steps required for the given healthcare service.
 */
export const getStepsFromService = (
  healthcareService: HealthcareService,
  dataLink?: string,
  draftOrderId?: string,
): StepItem[] => {
  // !!!TODO: write dynamic function to check if service is active or not and push appropriate steps
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
        {
          id: 'informed-consent',
          content: <InformedConsent />,
        },
        { id: 'phlebotomy', content: <PhlebotomyLocationSelect /> },
        { id: 'scheduler', content: <PhlebotomyScheduler /> },
        { id: 'summary', content: <OrderSummary /> },
        { id: 'success', content: <Success /> },
      ];
    case ENVIRONMENTAL_TOXINS:
      return [
        { id: 'toxin-select', content: <ToxinsSelect /> },
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'informed-consent', content: <InformedConsent /> },
        { id: 'confirm-address', content: <ConfirmAddress /> },
        { id: 'summary', content: <OrderSummary /> },
        { id: 'success', content: <Success /> },
      ];
    case CONTINUOUS_GLUCOSE_MONITOR:
    case GUT_MICROBIOME_ANALYSIS:
      return [
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'informed-consent', content: <InformedConsent /> },
        { id: 'confirm-address', content: <ConfirmAddress /> },
        { id: 'summary', content: <OrderSummary /> },
        { id: 'success', content: <Success /> },
      ];
    case FULL_BODY_MRI:
    case VO2_MAX_TEST:
    case DEXA_SCAN:
    case HEART_CALCIUM_SCAN:
    case FULL_GENETIC_SEQUENCING:
      return [
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'concierge', content: <MessageConcierge /> },
      ];
    case PFAS_CHEMICALS:
    case INTESTINAL_PERMEABILITY_PANEL:
    case FOOD_ENVIRENMENTAL_ALLERGY:
    case CUSTOM_BLOOD_PANEL:
      return [{ id: 'early-access', content: <EarlyAccessContent /> }];
    case ADVISORY_CALL: {
      const haveRdn = dataLink && dataLink !== '';

      // If user have assigned RDN and draftOrderId was passed (finish order)
      if (haveRdn && draftOrderId) {
        return [
          { id: 'calendly', content: <Calendly /> },
          { id: 'success', content: <Success /> },
        ];
      }

      // If user has assigned RDN and draftOrderId was not passed (fresh order)
      if (haveRdn) {
        return [
          { id: 'info', content: <HealthcareServiceDetails /> },
          { id: 'summary', content: <OrderSummary /> },
          { id: 'calendly', content: <Calendly /> },
          { id: 'success', content: <Success /> },
        ];
      }

      // If user doesnt have RDN assigned
      return [{ id: 'early-access', content: <EarlyAccessContent /> }];
    }
    // if separate toxin test is recommended via action plan
    case TOTAL_TOXIN_TEST:
    case ENVIRONMENTAL_TOXIN_TEST:
    case MYCOTOXINS_TEST:
    case HEAVY_METALS_TEST:
      return [
        { id: 'info', content: <HealthcareServiceDetails /> },
        { id: 'confirm-address', content: <ConfirmAddress /> },
        { id: 'summary', content: <OrderSummary /> },
        { id: 'success', content: <Success /> },
      ];

    default:
      return [{ id: 'early-access', content: <EarlyAccessContent /> }];
  }
};
