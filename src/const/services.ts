export const GRAIL_GALLERI_MULTI_CANCER_TEST =
  'Grail Galleri Multi Cancer Test';
export const GRAIL_GALLERI_MULTI_CANCER_TEST_ID =
  'grail-galleri-multi-cancer-test';
export const GUT_MICROBIOME_ANALYSIS = 'Gut Microbiome Analysis';
export const GUT_MICROBIOME_ANALYSIS_ID = 'gut-microbiome-analysis';
export const TOTAL_TOXIN_TEST = 'Total Toxins';
export const TOTAL_TOXIN_TEST_ID = 'total-toxins';
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

export const CUSTOM_BLOOD_PANEL = 'Custom Blood Panel';
export const CUSTOM_BLOOD_PANEL_ID = 'v2-custom-blood-panel';

export const MYCOTOXINS_TEST = 'Mycotoxins';
export const MYCOTOXINS_TEST_ID = 'mycotoxins';

export const ENVIRONMENTAL_TOXIN_TEST = 'Environmental Toxin';
export const ENVIRONMENTAL_TOXIN_TEST_ID = 'environmental-toxin';

export const ENVIRONMENTAL_TOXINS = 'Environmental Toxins';
export const HEAVY_METALS_TEST = 'Heavy Metals';
export const HEAVY_METALS_TEST_ID = 'heavy-metals';

export const ADVANCED_BLOOD_PANEL = 'Advanced Blood Panel';
export const IV_DRIP = 'IV Drip';

// Blood panel services that should be treated as "relevant" for data gating
export const BLOOD_PANEL_SERVICES = [
  SUPERPOWER_BLOOD_PANEL,
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
] as const;

export const isBloodPanelService = (serviceName: string) =>
  BLOOD_PANEL_SERVICES.includes(
    serviceName as (typeof BLOOD_PANEL_SERVICES)[number],
  );

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

export const LAB_ORDER_SUPPORTED_SERVICES = [
  SUPERPOWER_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  ADVANCED_BLOOD_PANEL,
  CARDIOVASCULAR_PANEL,
  METABOLIC_PANEL,
  METHYLATION_PANEL,
  FEMALE_FERTILITY_PANEL,
  AUTOIMMUNITY_AND_CELIAC_PANEL,
  NUTRIENT_AND_ANTIOXIDANT_PANEL,
];

export const RECOMMENDED_SERVICES = [
  SUPERPOWER_BLOOD_PANEL,
  ADVANCED_BLOOD_PANEL,
  CUSTOM_BLOOD_PANEL,
  GUT_MICROBIOME_ANALYSIS,
  ENVIRONMENTAL_TOXIN_TEST,
  MYCOTOXINS_TEST,
];

export const KIT_SERVICES = new Set([
  GUT_MICROBIOME_ANALYSIS,
  ENVIRONMENTAL_TOXIN_TEST,
  MYCOTOXINS_TEST,
  HEAVY_METALS_TEST,
]);

// we assume those services can be ordered through the lab
export const checkLabOrderSupport = (serviceName: string) => {
  return LAB_ORDER_SUPPORTED_SERVICES.includes(serviceName);
};

export const MAX_TUBE_COUNT = 14;
export const BASELINE_TUBE_COUNT = 6;
