import { ReactNode } from 'react';

import {
  ADVANCED_BLOOD_PANEL,
  ADVISORY_CALL,
  CONTINUOUS_GLUCOSE_MONITOR,
  DEXA_SCAN,
  ENVIRONMENTAL_TOXIN_TEST,
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
import { HealthcareService } from '@/types/api';

import {
  ConfirmAddress,
  EarlyAccessContent,
  HealthcareServiceDetails,
  InformedConsent,
  MessageConcierge,
  OrderSummary,
  PhlebotomyLocationSelect,
  PhlebotomyScheduler,
  Success,
} from '../components/steps';
import { StepID } from '../types/step-id';

interface TypedStepItem {
  id: StepID;
  content: ReactNode;
}

/**
 * Retrieves the steps required for scheduling based on the healthcare service provided.
 * This function returns an array of steps (`StepItem[]`) specific to the given healthcare service.
 *
 * @param {HealthcareService} healthcareService - The healthcare service for which to retrieve steps.
 * @returns {TypedStepItem[]} An array of steps required for the given healthcare service.
 */
export const getStepsFromService = (
  healthcareService: HealthcareService,
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
        // { id: StepID.REFERRAL, content: <InviteFriend /> },
      ];
    case ADVANCED_BLOOD_PANEL:
      return [
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.PHLEBOTOMY, content: <PhlebotomyLocationSelect /> },
        { id: StepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
      ];
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return [
        {
          id: StepID.INFO,
          content: <HealthcareServiceDetails />,
        },
        { id: StepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: StepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
        // { id: StepID.REFERRAL, content: <InviteFriend /> },
      ];
    case CONTINUOUS_GLUCOSE_MONITOR:
    case GUT_MICROBIOME_ANALYSIS:
      return [
        {
          id: StepID.INFO,
          content: <HealthcareServiceDetails />,
        },
        { id: StepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: StepID.CONFIRM_ADDRESS, content: <ConfirmAddress /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
        // { id: StepID.REFERRAL, content: <InviteFriend /> },
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
      return [
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
        // { id: StepID.REFERRAL, content: <InviteFriend /> },
      ];
    }
    case TOTAL_TOXIN_TEST:
    case ENVIRONMENTAL_TOXIN_TEST:
    case MYCOTOXINS_TEST:
    case HEAVY_METALS_TEST:
      return [
        { id: StepID.INFO, content: <HealthcareServiceDetails /> },
        { id: StepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: StepID.CONFIRM_ADDRESS, content: <ConfirmAddress /> },
        { id: StepID.SUMMARY, content: <OrderSummary /> },
        { id: StepID.SUCCESS, content: <Success /> },
        // { id: StepID.REFERRAL, content: <InviteFriend /> },
      ];

    default:
      return [{ id: StepID.EARLY_ACCESS, content: <EarlyAccessContent /> }];
  }
};
