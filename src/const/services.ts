export const GRAIL_GALLERI_MULTI_CANCER_TEST =
  'Grail Galleri Multi Cancer Test';
export const GUT_MICROBIOME_ANALYSIS = 'Gut Microbiome Analysis';
export const TOTAL_TOXIN_TEST = 'Total Toxins';
export const SUPERPOWER_BLOOD_PANEL = 'Superpower Blood Panel';
export const SUPERPOWER_ADVANCED_BLOOD_PANEL = 'Advanced Blood Panel';
export const ADVISORY_CALL = '1-1 Advisory Call';
export const ENVIRONMENTAL_TOXINS = 'Environmental Toxins';
export const PFAS_CHEMICALS = 'PFAS Chemicals';
export const INTESTINAL_PERMEABILITY_PANEL = 'Intestinal Permeability Panel';
export const FOOD_ENVIRENMENTAL_ALLERGY =
  'Food & Environmental Allergy Testing';
export const FULL_GENETIC_SEQUENCING = 'Full Genetic Sequencing';
export const HEART_CALCIUM_SCAN = 'Heart Calcium Scan';
export const DEXA_SCAN = 'DEXA Scan';
export const VO2_MAX_TEST = 'VO2 Max Test';
export const FULL_BODY_MRI = 'Full Body MRI';
export const CONTINUOUS_GLUCOSE_MONITOR = 'Continuous Glucose Monitor';
export const CUSTOM_BLOOD_PANEL = 'Custom Blood Panel';
export const MYCOTOXINS_TEST = 'Mycotoxins';
export const ENVIRONMENTAL_TOXIN_TEST = 'Environmental Toxin';
export const HEAVY_METALS_TEST = 'Heavy Metals';
export const ADVANCED_BLOOD_PANEL = 'Advanced Blood Panel';
export const IV_DRIP = 'IV Drip';

export const READY_NUM_HOURS_BEFORE_ADVISORY = 2;

export enum ServiceTypeEnum {
  Baseline = 'v2-baseline',
  Advanced = 'v2-advanced',
}
export type ServiceType = ServiceTypeEnum;

export enum ServiceLabTypeEnum {
  Labcorp = 'labcorp',
  Quest = 'quest',
  Bioref = 'bioref',
}
export type ServiceLabType = ServiceLabTypeEnum;

// side note we dont have a good way right now to get individual charge items from server
// so we just stick to that approach
export const UPGRADE_PRICE = 19900;
