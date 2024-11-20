import { ReactNode } from 'react';

import {
  ADVISORY_CALL,
  CONTINUOUS_GLUCOSE_MONITOR,
  DEXA_SCAN,
  ENVIRONMENTAL_TOXIN_TEST,
  ENVIRONMENTAL_TOXINS,
  FULL_BODY_MRI,
  FULL_GENETIC_SEQUENCING,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  HEART_CALCIUM_SCAN,
  HEAVY_METALS_TEST,
  MYCOTOXINS_TEST,
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
import { HealthcareService } from '@/types/api';

interface TypedStepItem {
  id: StepID;
  content: ReactNode;
}

export enum StepID {
  INFO = 'info',
  PHLEBOTOMY = 'phlebotomy',
  SCHEDULER = 'scheduler',
  SUMMARY = 'summary',
  SUCCESS = 'success',
  INFORMED_CONSENT = 'informed-consent',
  CONFIRM_ADDRESS = 'confirm-address',
  CONCIERGE = 'concierge',
  EARLY_ACCESS = 'early-access',
  TOXIN_SELECT = 'toxin-select',
  CALENDLY = 'calendly',
}
/**
 * Retrieves the steps required for scheduling based on the healthcare service provided.
 * This function returns an array of steps (`StepItem[]`) specific to the given healthcare service.
 *
 * @param {HealthcareService} healthcareService - The healthcare service for which to retrieve steps.
 * @param dataLink tells us if there is assigned RDN to this user
 * @param draftOrderId tells us if service was already booked and we need to drop some steps
 * @returns {TypedStepItem[]} An array of steps required for the given healthcare service.
 */
export const getStepsFromService = (
  healthcareService: HealthcareService,
  dataLink?: string,
): TypedStepItem[] => {
  if (!healthcareService.active) {
    return [{ id: StepID.EARLY_ACCESS, content: <EarlyAccessContent /> }];
  }

  switch (healthcareService.name) {
    case SUPERPOWER_BLOOD_PANEL:
      return [
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.PHLEBOTOMY, content: <PhlebotomyLocationSelect /> },
        { id: StepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
      ];
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return [
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: StepID.PHLEBOTOMY, content: <PhlebotomyLocationSelect /> },
        { id: StepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
      ];
    case ENVIRONMENTAL_TOXINS:
      return [
        { id: StepID.TOXIN_SELECT, content: <ToxinsSelect /> },
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: StepID.CONFIRM_ADDRESS, content: <ConfirmAddress /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
      ];
    case CONTINUOUS_GLUCOSE_MONITOR:
    case GUT_MICROBIOME_ANALYSIS:
      return [
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: StepID.CONFIRM_ADDRESS, content: <ConfirmAddress /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
      ];
    case FULL_BODY_MRI:
    case VO2_MAX_TEST:
    case DEXA_SCAN:
    case HEART_CALCIUM_SCAN:
    case FULL_GENETIC_SEQUENCING:
      return [
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.CONCIERGE, content: <MessageConcierge /> },
      ];
    case ADVISORY_CALL: {
      const haveRdn = dataLink && dataLink !== '';

      // If user has assigned RDN and draftOrderId was not passed (fresh order)
      if (haveRdn) {
        return [
          { id: StepID.INFO, content: <HealthcareServiceDetails /> },
          { id: StepID.SUMMARY, content: <OrderSummary /> },
          { id: StepID.CALENDLY, content: <Calendly /> },
          { id: StepID.SUCCESS, content: <Success /> },
        ];
      }

      // If user doesnt have RDN assigned
      return [{ id: StepID.EARLY_ACCESS, content: <EarlyAccessContent /> }];
    }
    // if separate toxin test is recommended via action plan
    case TOTAL_TOXIN_TEST:
    case ENVIRONMENTAL_TOXIN_TEST:
    case MYCOTOXINS_TEST:
    case HEAVY_METALS_TEST:
      return [
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.CONFIRM_ADDRESS, content: <ConfirmAddress /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
      ];

    default:
      return [{ id: StepID.EARLY_ACCESS, content: <EarlyAccessContent /> }];
  }
};
