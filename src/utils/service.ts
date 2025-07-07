import { AnimatedTimelineType } from '@/components/ui/animated-timeline';
import {
  AGREEMENT_COPIES,
  CONTINUOUS_GLUCOSE_MONITOR,
  ENVIRONMENTAL_TOXINS,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  LEGAL_DESCLAIMERS,
  TOTAL_TOXIN_TEST,
} from '@/const';
import { SERVICE_DETAILS } from '@/const/service-details';
import { CollectionMethodType, HealthcareService } from '@/types/api';
import { ServiceDetails } from '@/types/service';

export const getServiceTimeline = (
  healthcareService: HealthcareService | null,
  collectionMethod: CollectionMethodType | null,
): AnimatedTimelineType[] => {
  if (!healthcareService) return [];

  if (healthcareService.phlebotomy) {
    return [
      { title: 'Test ordered', complete: true },
      { title: 'Schedule a test appointment', complete: true },
      {
        title:
          collectionMethod === 'IN_LAB'
            ? 'Phlebotomist completes your blood draw appointment in ~15 minutes'
            : 'At-home testing',
        complete: false,
      },
      { title: 'Test results processed within 10 days', complete: false },
      { title: 'Results uploaded', complete: false },
      { title: 'Schedule a follow-up appointment', complete: false },
    ];
  }

  switch (healthcareService.name) {
    case GUT_MICROBIOME_ANALYSIS: {
      return [
        { title: 'Test ordered', complete: true },
        {
          title: 'At-home testing',
          complete: false,
        },
        { title: 'Test results processed within 2-4 weeks', complete: false },
        { title: 'Results uploaded', complete: false },
        { title: 'Schedule a follow-up appointment', complete: false },
      ];
    }
    default: {
      return [];
    }
  }
};

export const getDetailsForService = (
  healthcareServiceName: string,
): ServiceDetails | undefined => {
  return SERVICE_DETAILS[healthcareServiceName];
};

export const getSampleReportLinkForService = (service: string) => {
  switch (service) {
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return {
        pdf: '/sample-reports/grail-galleri-multi-cancer-test.pdf',
        preview:
          '/sample-reports/grail-galleri-multi-cancer-test-placeholder.webp',
      };
    case GUT_MICROBIOME_ANALYSIS:
      return {
        pdf: '/sample-reports/gut-microbiome-analysis.pdf',
        preview: '/sample-reports/gut-microbiome-analysis-placeholder.webp',
      };
    case TOTAL_TOXIN_TEST:
      return {
        pdf: '/sample-reports/total-toxins.pdf',
        preview: '/sample-reports/total-toxins-placeholder.webp',
      };
    default:
      return undefined;
  }
};

/**
 * Retrieves the legal disclaimer for a specific healthcare service.
 * If the service does not have a specific disclaimer, the disclaimer for environmental toxins is used by default.
 *
 * @param service - The healthcare service for which to retrieve the legal disclaimer.
 * @returns {JSX.Element} The corresponding legal disclaimer for the given healthcare service.
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
export const getInformedConsentForService = (service: string): JSX.Element => {
  switch (service) {
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return LEGAL_DESCLAIMERS.grail;
    case ENVIRONMENTAL_TOXINS:
      return LEGAL_DESCLAIMERS.toxins;
    case GUT_MICROBIOME_ANALYSIS:
      return LEGAL_DESCLAIMERS.gut;
    case CONTINUOUS_GLUCOSE_MONITOR:
      return LEGAL_DESCLAIMERS.glucose;
    default:
      return LEGAL_DESCLAIMERS.generic;
  }
};

export const getDefaultAgreementCopyForService = (
  service: string,
): JSX.Element => {
  switch (service) {
    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return AGREEMENT_COPIES.grail;
    case GUT_MICROBIOME_ANALYSIS:
      return AGREEMENT_COPIES.gut;
    default:
      return AGREEMENT_COPIES.regular;
  }
};
