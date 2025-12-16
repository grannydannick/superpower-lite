import { AnimatedTimelineType } from '@/components/ui/animated-timeline';
import {
  ADVANCED_BLOOD_PANEL,
  ADVISORY_CALL,
  AGREEMENT_COPIES,
  AUTOIMMUNITY_AND_CELIAC_PANEL,
  CARDIOVASCULAR_PANEL,
  CONTINUOUS_GLUCOSE_MONITOR,
  CUSTOM_BLOOD_PANEL,
  DEXA_SCAN,
  ENVIRONMENTAL_TOXIN_TEST,
  ENVIRONMENTAL_TOXINS,
  FEMALE_FERTILITY_PANEL,
  FOOD_ENVIRONMENTAL_ALLERGY,
  FULL_BODY_MRI,
  FULL_GENETIC_SEQUENCING,
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  HEART_CALCIUM_SCAN,
  HEAVY_METALS_TEST,
  INTESTINAL_PERMEABILITY_PANEL,
  IV_DRIP,
  LEGAL_DESCLAIMERS,
  METABOLIC_PANEL,
  METHYLATION_PANEL,
  MYCOTOXINS_TEST,
  NUTRIENT_AND_ANTIOXIDANT_PANEL,
  PFAS_CHEMICALS,
  SUPERPOWER_BLOOD_PANEL,
  TOTAL_TOXIN_TEST,
  VO2_MAX_TEST,
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
      { title: 'Action plan ready', complete: false },
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
  serviceName: string,
): ServiceDetails | undefined => {
  return SERVICE_DETAILS[serviceName];
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
    case ENVIRONMENTAL_TOXIN_TEST:
      return {
        pdf: '/sample-reports/environmental-toxin-test.pdf',
        preview: '/sample-reports/environmental-toxin-test-placeholder.webp',
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
    case ENVIRONMENTAL_TOXIN_TEST ||
      HEAVY_METALS_TEST ||
      MYCOTOXINS_TEST ||
      TOTAL_TOXIN_TEST:
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

const serviceImages: Record<string, string> = {
  SuperpowerBloodPanel: '/services/transparent/baseline_blood_panel.png',
  AdvancedBloodPanel: '/services/transparent/advanced_blood_panel.png',
  OneOnOneAdvisory: '/services/1-1_advisory_call.png',
  ComprehensiveGeneticsPanel: '/services/comprehensive_genetics_panel.png',
  ContinuousGlucoseMonitor: '/services/continuous_glucose_monitor.png',
  CustomBloodPanel: '/services/transparent/custom_blood_panel.png',
  DexaScan: '/services/dexa_scan.png',
  EnvironmentToxin: '/services/transparent/environmental_toxin_test.png',
  EnvironmentToxins: '/services/environmental_toxins.png',
  FoodAndEnvAllergyTesting:
    '/services/food_and_environmental_allergy_testing.png',
  FullBodyMri: '/services/full_body_mri.png',
  FullGeneticSequencing: '/services/full_genetic_sequencing.png',
  GrailGalleriMultiCancer:
    '/services/transparent/grail_galleri_multi_cancer_test.png',
  GutMicrobiome: '/services/transparent/gut_microbiome_analysis.png',
  HeartCalcScan: '/services/heart_calcium_scan.png',
  HeavyMetals: '/services/transparent/heavy_metal_toxins_test.png',
  IntestinalPermeability: '/services/intestinal_permeability_panel.png',
  IVDrip: '/services/iv_drip.png',
  MyCotoxins: '/services/transparent/mycotoxins.png',
  PfasChemicals: '/services/pfas_chemicals.png',
  TotalToxins: '/services/transparent/total_toxins_test.png',
  Vo2Max: '/services/vo2_max_test.png',
  AutoimmunityBundle: '/services/autoimmunity.png',
  CardiometabolicBundle: '/services/cardiovascular.png',
  FemaleFertilityBundle: '/services/female_fertility.png',
  MetabolicBundle: '/services/metabolic.png',
  MethylationBundle: '/services/methylation.png',
  NutritionBundle: '/services/nutrient_and_antioxidant.png',
};

export const getServiceImage = (name: string): string => {
  switch (name) {
    case SUPERPOWER_BLOOD_PANEL:
      return serviceImages.SuperpowerBloodPanel;

    case ADVANCED_BLOOD_PANEL:
      return serviceImages.AdvancedBloodPanel;

    case ADVISORY_CALL:
      return serviceImages.OneOnOneAdvisory;

    case CONTINUOUS_GLUCOSE_MONITOR:
      return serviceImages.ContinuousGlucoseMonitor;

    case CUSTOM_BLOOD_PANEL:
      return serviceImages.CustomBloodPanel;

    case GRAIL_GALLERI_MULTI_CANCER_TEST:
      return serviceImages.GrailGalleriMultiCancer;

    case GUT_MICROBIOME_ANALYSIS:
      return serviceImages.GutMicrobiome;

    case TOTAL_TOXIN_TEST:
      return serviceImages.TotalToxins;

    case ENVIRONMENTAL_TOXIN_TEST:
      return serviceImages.EnvironmentToxin;

    case ENVIRONMENTAL_TOXINS:
      return serviceImages.EnvironmentToxins;

    case FOOD_ENVIRONMENTAL_ALLERGY:
      return serviceImages.FoodAndEnvAllergyTesting;

    case FULL_GENETIC_SEQUENCING:
      return serviceImages.FullGeneticSequencing;

    case FULL_BODY_MRI:
      return serviceImages.FullBodyMri;

    case HEART_CALCIUM_SCAN:
      return serviceImages.HeartCalcScan;

    case DEXA_SCAN:
      return serviceImages.DexaScan;

    case VO2_MAX_TEST:
      return serviceImages.Vo2Max;

    case INTESTINAL_PERMEABILITY_PANEL:
      return serviceImages.IntestinalPermeability;

    case PFAS_CHEMICALS:
      return serviceImages.PfasChemicals;

    case MYCOTOXINS_TEST:
      return serviceImages.MyCotoxins;

    case HEAVY_METALS_TEST:
      return serviceImages.HeavyMetals;

    case IV_DRIP:
      return serviceImages.IVDrip;

    case AUTOIMMUNITY_AND_CELIAC_PANEL:
      return serviceImages.AutoimmunityBundle;

    case CARDIOVASCULAR_PANEL:
      return serviceImages.CardiometabolicBundle;

    case FEMALE_FERTILITY_PANEL:
      return serviceImages.FemaleFertilityBundle;

    case METABOLIC_PANEL:
      return serviceImages.MetabolicBundle;

    case METHYLATION_PANEL:
      return serviceImages.MethylationBundle;

    case NUTRIENT_AND_ANTIOXIDANT_PANEL:
      return serviceImages.NutritionBundle;

    default:
      return serviceImages.SuperpowerBloodPanel;
  }
};

export const BEST_VALUE_SERVICES = [TOTAL_TOXIN_TEST];
export const BEST_SELLER_SERVICES = [GUT_MICROBIOME_ANALYSIS];
export const SALE_SERVICES = [SUPERPOWER_BLOOD_PANEL];

export const getServiceBadge = (serviceName: string): string | null => {
  switch (true) {
    case BEST_VALUE_SERVICES.includes(serviceName):
      return 'Best value';

    case BEST_SELLER_SERVICES.includes(serviceName):
      return 'Bestseller';

    case SALE_SERVICES.includes(serviceName):
      return 'Sale';

    default:
      return null;
  }
};
