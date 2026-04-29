export const GRAIL_GALLERI_MULTI_CANCER_TEST =
  'Grail Galleri Multi Cancer Test';
export const GRAIL_GALLERI_MULTI_CANCER_TEST_ID =
  'grail-galleri-multi-cancer-test';
export const GUT_MICROBIOME_ANALYSIS = 'Gut Microbiome Analysis';
export const GUT_MICROBIOME_ANALYSIS_ID = 'gut-microbiome-analysis';
export const TOTAL_TOXIN_TEST = 'Total Toxins';
export const TOTAL_TOXIN_TEST_ID = 'mosaic-envirotox';
export const SUPERPOWER_BLOOD_PANEL = 'Superpower Blood Panel';
export const ADVISORY_CALL = '1-1 Advisory Call';
export const PFAS_CHEMICALS = 'PFAS Chemicals';

export const INTESTINAL_PERMEABILITY_PANEL = 'Intestinal Permeability Panel';
export const FOOD_ENVIRONMENTAL_ALLERGY =
  'Food & Environmental Allergy Testing';

export const FULL_GENETIC_SEQUENCING = 'Full Genetic Sequencing';

export const HEART_CALCIUM_SCAN = 'Heart Calcium Scan';

export const DEXA_SCAN = 'DEXA Scan';

export const VO2_MAX_TEST = 'VO2 Max Test';

export const FULL_BODY_MRI = 'Full Body MRI';

export const CONTINUOUS_GLUCOSE_MONITOR = 'Continuous Glucose Monitor';

export const MYCOTOXINS_TEST = 'Mycotoxins';
export const MYCOTOXINS_TEST_ID = 'mosaic-mycotox';

export const ENVIRONMENTAL_TOXINS_TEST = 'Environmental Toxins';
export const ENVIRONMENTAL_TOXINS_TEST_ID = 'mosaic-toxdetect';

export const ENVIRONMENTAL_TOXINS = 'Environmental Toxins';
export const HEAVY_METALS_TEST = 'Heavy Metals';
export const HEAVY_METALS_TEST_ID = 'mosaic-toxic-metals';

export const ADVANCED_BLOOD_PANEL = 'Advanced Blood Panel';
export const ADVANCED_BLOOD_PANEL_SERVICE_PREFIX = 'v2-advanced-blood-panel';
export const PERFORMANCE_BLOOD_PANEL = 'Performance Initial Blood Panel';
export const PERFORMANCE_BLOOD_PANEL_SERVICE_PREFIX = 'v3-performance-initial';
export const IV_DRIP = 'IV Drip';

export const CARDIOVASCULAR_PANEL = 'Cardiovascular Panel';
export const METABOLIC_PANEL = 'Metabolic Panel';
export const METHYLATION_PANEL = 'Methylation Panel';
export const FEMALE_FERTILITY_PANEL = 'Female Fertility Panel';
export const AUTOIMMUNITY_AND_CELIAC_PANEL = 'Autoimmunity & Celiac Panel';
export const NUTRIENT_AND_ANTIOXIDANT_PANEL = 'Nutrient & Antioxidant Panel';
export const ORGAN_AGE_PANEL = 'Organ Age Panel';
export const MALE_HEALTH_PANEL = "Men's Health Panel";
export const THYROID_PANEL = 'Thyroid Panel';
export const OMEGA_PANEL = 'Omega Panel';
export const FATIGUE_PANEL = 'Fatigue Panel';
export const ANEMIA_PANEL = 'Anemia Panel';

export const READY_NUM_HOURS_BEFORE_ADVISORY = 2;

// side note we dont have a good way right now to get individual charge items from server
// so we just stick to that approach
export const UPGRADE_PRICE = 18900;
export const UPGRADE_PRICE_NYNJ = 19900;

// Bundle prices for the advanced-upgrade A/B test (cents). Values mirror the
// Stripe Prices for lookup keys `sp-membership-advanced-microbiome-bundle[-ny-nj]`
// and `sp-membership-complete-bundle[-ny-nj]`.
export const ADVANCED_MICROBIOME_BUNDLE_PRICE = 37900;
export const ADVANCED_MICROBIOME_BUNDLE_PRICE_NYNJ = 37900;
export const COMPLETE_BUNDLE_PRICE = 94900;
export const COMPLETE_BUNDLE_PRICE_NYNJ = 94900;

// Bundle ids — must match `AdvancedUpgradeBundleId` in ts-server's
// product-to-service-map.ts, and the `code` field on each FHIR CID.
export const ADVANCED_UPGRADE_BUNDLE_IDS = {
  ADVANCED_UPGRADE: 'v2-membership-advanced-upgrade',
  ADVANCED_MICROBIOME_BUNDLE: 'v2-membership-advanced-microbiome-bundle',
  COMPLETE_BUNDLE: 'v2-membership-complete-bundle',
} as const;

export const ADVANCED_UPGRADE_BUNDLE_ID_VALUES = [
  ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE,
  ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE,
  ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE,
] as const;

export type AdvancedUpgradeBundleId =
  (typeof ADVANCED_UPGRADE_BUNDLE_ID_VALUES)[number];

export const RECOMMENDED_SERVICES = [
  SUPERPOWER_BLOOD_PANEL,
  ADVANCED_BLOOD_PANEL,
  GUT_MICROBIOME_ANALYSIS,
  ENVIRONMENTAL_TOXINS_TEST,
  MYCOTOXINS_TEST,
];

export const KIT_SERVICES = new Set([
  GUT_MICROBIOME_ANALYSIS,
  ENVIRONMENTAL_TOXINS_TEST,
  MYCOTOXINS_TEST,
  HEAVY_METALS_TEST,
]);

export const TOXIN_SERVICES = [
  TOTAL_TOXIN_TEST,
  MYCOTOXINS_TEST,
  ENVIRONMENTAL_TOXINS_TEST,
  HEAVY_METALS_TEST,
];

export const MAX_TUBE_COUNT = 14;
export const BASELINE_TUBE_COUNT = 6;
