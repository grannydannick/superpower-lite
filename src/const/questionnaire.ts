const INTAKE_QUESTIONNAIRE = 'onboarding-intake';

// GLP-1 FRONTDOOR EXPERIMENT
export const GLP_FRONTDOOR_EXPERIMENT = 'glp-frontdoor-experiment';

// RX ASSESSMENTS
const RX_ASSESSMENT_GHK_CU = 'rx-assessment-ghk-cu';
const RX_GHK_CU_SYMPTOM_TRACKER = 'rx-assessment-ghk-cu-symptom-tracker';
const RX_SEMAGLUTIDE = 'rx-assessment-semaglutide';
const RX_SEMAGLUTIDE_SYMPTOM_TRACKER =
  'rx-assessment-semaglutide-symptom-tracker';
const RX_SERMORELIN_INJECTABLE = 'rx-assessment-sermorelin-injectable';
const RX_SERMORELIN_INJECTABLE_SYMPTOM_TRACKER =
  'rx-assessment-sermorelin-injectable-symptom-tracker';
const RX_SERMORELIN_TROCHE = 'rx-assessment-sermorelin-troche';
const RX_SERMORELIN_TROCHE_SYMPTOM_TRACKER =
  'rx-assessment-sermorelin-troche-symptom-tracker';
const RX_VIP_NASAL_SPRAY = 'rx-assessment-vip-nasal-spray';
const RX_VIP_NASAL_SPRAY_SYMPTOM_TRACKER =
  'rx-assessment-vip-nasal-spray-symptom-tracker';
const RX_METFORMIN = 'rx-assessment-metformin';
const RX_METFORMIN_SYMPTOM_TRACKER = 'rx-assessment-metformin-symptom-tracker';
const RX_OLYMPUS_MALE_MAX = 'rx-assessment-olympus-male-max';
const RX_OLYMPUS_MALE_MAX_SYMPTOM_TRACKER =
  'rx-assessment-olympus-male-max-symptom-tracker';
const RX_HCG_PREGNYL = 'rx-assessment-hcg-pregnyl';
const RX_HCG_PREGNYL_SYMPTOM_TRACKER =
  'rx-assessment-hcg-pregnyl-symptom-tracker';
const RX_GONADORELIN = 'rx-assessment-gonadorelin';
const RX_GONADORELIN_SYMPTOM_TRACKER =
  'rx-assessment-gonadorelin-symptom-tracker';
const RX_NAD_INJECTABLE = 'rx-assessment-nad-injectable';
const RX_NAD_INJECTABLE_SYMPTOM_TRACKER =
  'rx-assessment-nad-injectable-symptom-tracker';
const RX_NAD_NASAL_SPRAY = 'rx-assessment-nad-nasal-spray';
const RX_NAD_NASAL_SPRAY_SYMPTOM_TRACKER =
  'rx-assessment-nad-nasal-spray-symptom-tracker';
const RX_ALOE_VERA_TRETINOIN = 'rx-assessment-aloe-vera-tretinoin';
const RX_ALOE_VERA_TRETINOIN_SYMPTOM_TRACKER =
  'rx-assessment-aloe-vera-tretinoin-symptom-tracker';
const RX_ELAMIPRETIDE = 'rx-assessment-elamipretide';
const RX_ELAMIPRETIDE_SYMPTOM_TRACKER =
  'rx-assessment-elamipretide-symptom-tracker';
const RX_ENCLOMIPHENE = 'rx-assessment-enclomiphene';
const RX_ENCLOMIPHENE_SYMPTOM_TRACKER =
  'rx-assessment-enclomiphene-symptom-tracker';
const RX_TADALAFIL = 'rx-assessment-tadalafil';
const RX_TADALAFIL_SYMPTOM_TRACKER = 'rx-assessment-tadalafil-symptom-tracker';
const RX_LOW_DOSE_NALTREXONE = 'rx-assessment-low-dose-naltrexone';
const RX_LOW_DOSE_NALTREXONE_SYMPTOM_TRACKER =
  'rx-assessment-low-dose-naltrexone-symptom-tracker';
const RX_METHYLCOBALAMIN_B12 = 'rx-assessment-methylcobalamin-b12';
const RX_METHYLCOBALAMIN_B12_SYMPTOM_TRACKER =
  'rx-assessment-methylcobalamin-b12-symptom-tracker';
const RX_TRT_INJECTABLE = 'rx-assessment-trt-injectable';
const RX_TRT_INJECTABLE_SYMPTOM_TRACKER =
  'rx-assessment-trt-injectable-symptom-tracker';
const RX_TIRZEPATIDE = 'rx-assessment-tirzepatide';
const RX_TIRZEPATIDE_SYMPTOM_TRACKER =
  'rx-assessment-tirzepatide-symptom-tracker';

const RX_SYMPTOM_TRACKERS = [
  RX_GHK_CU_SYMPTOM_TRACKER,
  RX_SEMAGLUTIDE_SYMPTOM_TRACKER,
  RX_SERMORELIN_INJECTABLE_SYMPTOM_TRACKER,
  RX_SERMORELIN_TROCHE_SYMPTOM_TRACKER,
  RX_VIP_NASAL_SPRAY_SYMPTOM_TRACKER,
  RX_METFORMIN_SYMPTOM_TRACKER,
  RX_OLYMPUS_MALE_MAX_SYMPTOM_TRACKER,
  RX_HCG_PREGNYL_SYMPTOM_TRACKER,
  RX_GONADORELIN_SYMPTOM_TRACKER,
  RX_NAD_INJECTABLE_SYMPTOM_TRACKER,
  RX_NAD_NASAL_SPRAY_SYMPTOM_TRACKER,
  RX_ALOE_VERA_TRETINOIN_SYMPTOM_TRACKER,
  RX_ELAMIPRETIDE_SYMPTOM_TRACKER,
  RX_ENCLOMIPHENE_SYMPTOM_TRACKER,
  RX_TADALAFIL_SYMPTOM_TRACKER,
  RX_LOW_DOSE_NALTREXONE_SYMPTOM_TRACKER,
  RX_METHYLCOBALAMIN_B12_SYMPTOM_TRACKER,
  RX_TRT_INJECTABLE_SYMPTOM_TRACKER,
  RX_TIRZEPATIDE_SYMPTOM_TRACKER,
] as const;

type RxSymptomTrackerName = (typeof RX_SYMPTOM_TRACKERS)[number];

export const isSymptomTracker = (
  name: string | undefined,
): name is RxSymptomTrackerName => {
  return RX_SYMPTOM_TRACKERS.includes(name as any);
};

const RX_ASSESSMENTS = [
  RX_ASSESSMENT_GHK_CU,
  RX_GHK_CU_SYMPTOM_TRACKER,
  RX_SEMAGLUTIDE,
  RX_SEMAGLUTIDE_SYMPTOM_TRACKER,
  RX_SERMORELIN_INJECTABLE,
  RX_SERMORELIN_INJECTABLE_SYMPTOM_TRACKER,
  RX_SERMORELIN_TROCHE,
  RX_SERMORELIN_TROCHE_SYMPTOM_TRACKER,
  RX_VIP_NASAL_SPRAY,
  RX_VIP_NASAL_SPRAY_SYMPTOM_TRACKER,
  RX_METFORMIN,
  RX_METFORMIN_SYMPTOM_TRACKER,
  RX_OLYMPUS_MALE_MAX,
  RX_OLYMPUS_MALE_MAX_SYMPTOM_TRACKER,
  RX_HCG_PREGNYL,
  RX_HCG_PREGNYL_SYMPTOM_TRACKER,
  RX_GONADORELIN,
  RX_GONADORELIN_SYMPTOM_TRACKER,
  RX_NAD_INJECTABLE,
  RX_NAD_INJECTABLE_SYMPTOM_TRACKER,
  RX_NAD_NASAL_SPRAY,
  RX_NAD_NASAL_SPRAY_SYMPTOM_TRACKER,
  RX_ALOE_VERA_TRETINOIN,
  RX_ALOE_VERA_TRETINOIN_SYMPTOM_TRACKER,
  RX_ELAMIPRETIDE,
  RX_ELAMIPRETIDE_SYMPTOM_TRACKER,
  RX_ENCLOMIPHENE,
  RX_ENCLOMIPHENE_SYMPTOM_TRACKER,
  RX_TADALAFIL,
  RX_TADALAFIL_SYMPTOM_TRACKER,
  RX_LOW_DOSE_NALTREXONE,
  RX_LOW_DOSE_NALTREXONE_SYMPTOM_TRACKER,
  RX_METHYLCOBALAMIN_B12,
  RX_METHYLCOBALAMIN_B12_SYMPTOM_TRACKER,
  RX_TRT_INJECTABLE,
  RX_TRT_INJECTABLE_SYMPTOM_TRACKER,
  RX_TIRZEPATIDE,
  RX_TIRZEPATIDE_SYMPTOM_TRACKER,
] as const;
type RxQuestionnaireName =
  | typeof RX_ASSESSMENT_GHK_CU
  | typeof RX_GHK_CU_SYMPTOM_TRACKER
  | typeof RX_SEMAGLUTIDE
  | typeof RX_SEMAGLUTIDE_SYMPTOM_TRACKER
  | typeof RX_SERMORELIN_INJECTABLE
  | typeof RX_SERMORELIN_INJECTABLE_SYMPTOM_TRACKER
  | typeof RX_SERMORELIN_TROCHE
  | typeof RX_SERMORELIN_TROCHE_SYMPTOM_TRACKER
  | typeof RX_VIP_NASAL_SPRAY
  | typeof RX_VIP_NASAL_SPRAY_SYMPTOM_TRACKER
  | typeof RX_METFORMIN
  | typeof RX_METFORMIN_SYMPTOM_TRACKER
  | typeof RX_OLYMPUS_MALE_MAX
  | typeof RX_OLYMPUS_MALE_MAX_SYMPTOM_TRACKER
  | typeof RX_HCG_PREGNYL
  | typeof RX_HCG_PREGNYL_SYMPTOM_TRACKER
  | typeof RX_GONADORELIN
  | typeof RX_GONADORELIN_SYMPTOM_TRACKER
  | typeof RX_NAD_INJECTABLE
  | typeof RX_NAD_INJECTABLE_SYMPTOM_TRACKER
  | typeof RX_NAD_NASAL_SPRAY
  | typeof RX_NAD_NASAL_SPRAY_SYMPTOM_TRACKER
  | typeof RX_ALOE_VERA_TRETINOIN
  | typeof RX_ALOE_VERA_TRETINOIN_SYMPTOM_TRACKER
  | typeof RX_ELAMIPRETIDE
  | typeof RX_ELAMIPRETIDE_SYMPTOM_TRACKER
  | typeof RX_ENCLOMIPHENE
  | typeof RX_ENCLOMIPHENE_SYMPTOM_TRACKER
  | typeof RX_TADALAFIL
  | typeof RX_TADALAFIL_SYMPTOM_TRACKER
  | typeof RX_LOW_DOSE_NALTREXONE
  | typeof RX_LOW_DOSE_NALTREXONE_SYMPTOM_TRACKER
  | typeof RX_METHYLCOBALAMIN_B12
  | typeof RX_METHYLCOBALAMIN_B12_SYMPTOM_TRACKER
  | typeof RX_TRT_INJECTABLE
  | typeof RX_TRT_INJECTABLE_SYMPTOM_TRACKER
  | typeof RX_TIRZEPATIDE
  | typeof RX_TIRZEPATIDE_SYMPTOM_TRACKER
  // The following questionnaire 'names' are identifiers on the QuestionnaireResponse
  // used for front-door experiments. TODO: decouple the front door experiment name from the
  // actual questionnaire name.
  | typeof GLP_FRONTDOOR_EXPERIMENT;

export {
  INTAKE_QUESTIONNAIRE,
  RX_ASSESSMENT_GHK_CU,
  RX_GHK_CU_SYMPTOM_TRACKER,
  RX_ASSESSMENTS,
  RX_SYMPTOM_TRACKERS,
};

export type { RxQuestionnaireName, RxSymptomTrackerName };
