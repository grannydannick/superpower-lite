import { ReactNode } from 'react';

import {
  ADVANCED_BLOOD_PANEL,
  ADVISORY_CALL,
  AUTOIMMUNITY_AND_CELIAC_PANEL,
  CARDIOVASCULAR_PANEL,
  CONTINUOUS_GLUCOSE_MONITOR,
  CUSTOM_BLOOD_PANEL,
  DEXA_SCAN,
  ENVIRONMENTAL_TOXIN_TEST,
  FEMALE_FERTILITY_PANEL,
  FULL_BODY_MRI,
  FULL_GENETIC_SEQUENCING,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  HEART_CALCIUM_SCAN,
  HEAVY_METALS_TEST,
  METABOLIC_PANEL,
  METHYLATION_PANEL,
  MYCOTOXINS_TEST,
  NUTRIENT_AND_ANTIOXIDANT_PANEL,
  SUPERPOWER_BLOOD_PANEL,
  TOTAL_TOXIN_TEST,
  VO2_MAX_TEST,
} from '@/const';
import { BloodDrawRecommendations } from '@/features/orders/components/steps/blood-draw-recommendations';
import { Panels } from '@/features/orders/components/steps/panels';
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

export enum BookingStepID {
  INFO = 'info',
  PHLEBOTOMY = 'phlebotomy',
  SCHEDULER = 'scheduler',
  SUMMARY = 'summary',
  SUCCESS = 'success',
  INFORMED_CONSENT = 'informed-consent',
  CONFIRM_ADDRESS = 'confirm-address',
  CONCIERGE = 'concierge',
  EARLY_ACCESS = 'early-access',
  RECOMMENDATIONS = 'recommendations',
  PANELS = 'panels',
}

interface TypedStepItem {
  id: BookingStepID;
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
    return [
      { id: BookingStepID.INFO, content: <HealthcareServiceDetails /> },
      { id: BookingStepID.EARLY_ACCESS, content: <EarlyAccessContent /> },
    ];
  }

  switch (healthcareService.name) {
    // should never be orderable separately, only as part of custom panels
    case NUTRIENT_AND_ANTIOXIDANT_PANEL:
    case FEMALE_FERTILITY_PANEL:
    case AUTOIMMUNITY_AND_CELIAC_PANEL:
    case CARDIOVASCULAR_PANEL:
    case METABOLIC_PANEL:
    case METHYLATION_PANEL:
      return [
        { id: BookingStepID.INFO, content: <HealthcareServiceDetails /> },
      ];

    case SUPERPOWER_BLOOD_PANEL:
    case ADVANCED_BLOOD_PANEL:
      return [
        { id: BookingStepID.INFO, content: <HealthcareServiceDetails /> },
        {
          id: BookingStepID.RECOMMENDATIONS,
          content: <BloodDrawRecommendations />,
        },
        { id: BookingStepID.PHLEBOTOMY, content: <PhlebotomyLocationSelect /> },
        { id: BookingStepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: BookingStepID.SUMMARY, content: <OrderSummary /> },
        { id: BookingStepID.SUCCESS, content: <Success /> },
      ];
    case CUSTOM_BLOOD_PANEL:
      return [
        { id: BookingStepID.INFO, content: <HealthcareServiceDetails /> },
        {
          id: BookingStepID.RECOMMENDATIONS,
          content: <BloodDrawRecommendations />,
        },
        { id: BookingStepID.PANELS, content: <Panels /> },
        { id: BookingStepID.PHLEBOTOMY, content: <PhlebotomyLocationSelect /> },
        { id: BookingStepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: BookingStepID.SUMMARY, content: <OrderSummary /> },
        { id: BookingStepID.SUCCESS, content: <Success /> },
      ];
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return [
        {
          id: BookingStepID.INFO,
          content: <HealthcareServiceDetails />,
        },
        { id: BookingStepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: BookingStepID.CONFIRM_ADDRESS, content: <ConfirmAddress /> },
        { id: BookingStepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: BookingStepID.SUMMARY, content: <OrderSummary /> },
        { id: BookingStepID.SUCCESS, content: <Success /> },
      ];
    case CONTINUOUS_GLUCOSE_MONITOR:
    case GUT_MICROBIOME_ANALYSIS:
      return [
        {
          id: BookingStepID.INFO,
          content: <HealthcareServiceDetails />,
        },
        { id: BookingStepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: BookingStepID.CONFIRM_ADDRESS, content: <ConfirmAddress /> },
        { id: BookingStepID.SUMMARY, content: <OrderSummary /> },
        { id: BookingStepID.SUCCESS, content: <Success /> },
      ];
    case FULL_BODY_MRI:
    case VO2_MAX_TEST:
    case DEXA_SCAN:
    case HEART_CALCIUM_SCAN:
    case FULL_GENETIC_SEQUENCING:
      return [
        { id: BookingStepID.INFO, content: <HealthcareServiceDetails /> },
        { id: BookingStepID.CONCIERGE, content: <MessageConcierge /> },
      ];
    case ADVISORY_CALL: {
      return [
        { id: BookingStepID.INFO, content: <HealthcareServiceDetails /> },
        { id: BookingStepID.SCHEDULER, content: <PhlebotomyScheduler /> },
        { id: BookingStepID.SUMMARY, content: <OrderSummary /> },
        { id: BookingStepID.SUCCESS, content: <Success /> },
      ];
    }
    case TOTAL_TOXIN_TEST:
    case ENVIRONMENTAL_TOXIN_TEST:
    case MYCOTOXINS_TEST:
    case HEAVY_METALS_TEST:
      return [
        { id: BookingStepID.INFO, content: <HealthcareServiceDetails /> },
        { id: BookingStepID.INFORMED_CONSENT, content: <InformedConsent /> },
        { id: BookingStepID.CONFIRM_ADDRESS, content: <ConfirmAddress /> },
        { id: BookingStepID.SUMMARY, content: <OrderSummary /> },
        { id: BookingStepID.SUCCESS, content: <Success /> },
      ];

    default:
      return [
        { id: BookingStepID.EARLY_ACCESS, content: <EarlyAccessContent /> },
      ];
  }
};
