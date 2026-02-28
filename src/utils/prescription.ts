import {
  ENCLOMIPHENE,
  GHK_CU_CREAM,
  GONADORELIN,
  HCG,
  LOW_DOSE_NALTREXONE,
  METFORMIN,
  NAD_INJECTION,
  NAD_INTRANASAL,
  OXYTOCIN_BREMELANOTIDE_TADALAFIL_TROCHES,
  SEMAGLUTIDE,
  SERMORELIN_INJECTION,
  SERMORELIN_TROCHES,
  TADALAFIL,
  TIRZEPATIDE,
  TRETINOIN,
  VIP_NASAL_SPRAY,
  VITAMIN_B12_INJECTION,
} from '@/const';
import * as PrescriptionInfoData from '@/const/prescription-info';

const prescriptionImages: Record<string, string> = {
  SermorelinInjection: '/rx/transparent/sermorelin-injection.webp',
  VIPNasalSpray: '/rx/transparent/vip-nasal-spray.webp',
  Semaglutide: '/rx/transparent/semaglutide.webp',
  Gonadorelin: '/rx/transparent/gonadorelin.webp',
  NADIntranasal: '/rx/transparent/nad-plus-intranasal.webp',
  Oxytocin: '/rx/transparent/oxytocin.webp',
  Tadalafil: '/rx/transparent/tadalafil.webp',
  Metformin: '/rx/transparent/metformin.webp',
  Tretinoin: '/rx/transparent/tretinoin.webp',
  hCG: '/rx/transparent/hcg.webp',
  LowDoseNaltrexone: '/rx/transparent/ldn.webp',
  VitaminB12Injection: '/rx/transparent/b12-injection.webp',
  GHKCuCream: '/rx/transparent/ghk-cu-cream.webp',
  NADInjection: '/rx/transparent/nad-plus-injection.webp',
  Enclomiphene: '/rx/transparent/enclomiphene.webp',
  SermorelinTroches: '/rx/transparent/sermorelin-oral.webp',
  Tirzepatide: '/rx/transparent/tirzepatide.webp',
  FallbackImage: '/rx/prescription-empty.webp',
};

export const getPrescriptionImage = (name: string): string => {
  switch (name) {
    case SERMORELIN_INJECTION:
      return prescriptionImages.SermorelinInjection;

    case VIP_NASAL_SPRAY:
      return prescriptionImages.VIPNasalSpray;

    case SEMAGLUTIDE:
      return prescriptionImages.Semaglutide;

    case GONADORELIN:
      return prescriptionImages.Gonadorelin;

    case NAD_INTRANASAL:
      return prescriptionImages.NADIntranasal;

    case OXYTOCIN_BREMELANOTIDE_TADALAFIL_TROCHES:
      return prescriptionImages.Oxytocin;

    case TADALAFIL:
      return prescriptionImages.Tadalafil;

    case METFORMIN:
      return prescriptionImages.Metformin;

    case TRETINOIN:
      return prescriptionImages.Tretinoin;

    case HCG:
      return prescriptionImages.hCG;

    case LOW_DOSE_NALTREXONE:
      return prescriptionImages.LowDoseNaltrexone;

    case VITAMIN_B12_INJECTION:
      return prescriptionImages.VitaminB12Injection;

    case GHK_CU_CREAM:
      return prescriptionImages.GHKCuCream;

    case NAD_INJECTION:
      return prescriptionImages.NADInjection;

    case ENCLOMIPHENE:
      return prescriptionImages.Enclomiphene;

    case SERMORELIN_TROCHES:
      return prescriptionImages.SermorelinTroches;

    case TIRZEPATIDE:
      return prescriptionImages.Tirzepatide;

    default:
      return prescriptionImages.FallbackImage;
  }
};

type PrescriptionInfoKey = keyof typeof PrescriptionInfoData;
type PrescriptionInfo = (typeof PrescriptionInfoData)[PrescriptionInfoKey];

const prescriptionInfoMap: Record<string, PrescriptionInfo> = {
  [NAD_INTRANASAL]: PrescriptionInfoData.NAD_INTRANASAL,
  [SERMORELIN_INJECTION]: PrescriptionInfoData.SERMORELIN_INJECTION,
  [VIP_NASAL_SPRAY]: PrescriptionInfoData.VIP_NASAL_SPRAY,
  [SEMAGLUTIDE]: PrescriptionInfoData.SEMAGLUTIDE,
  [GONADORELIN]: PrescriptionInfoData.GONADORELIN,
  [OXYTOCIN_BREMELANOTIDE_TADALAFIL_TROCHES]:
    PrescriptionInfoData.OXYTOCIN_BREMELANOTIDE_TADALAFIL_TROCHES,
  [TADALAFIL]: PrescriptionInfoData.TADALAFIL,
  [METFORMIN]: PrescriptionInfoData.METFORMIN,
  [TRETINOIN]: PrescriptionInfoData.TRETINOIN,
  [HCG]: PrescriptionInfoData.HCG,
  [LOW_DOSE_NALTREXONE]: PrescriptionInfoData.LOW_DOSE_NALTREXONE,
  [VITAMIN_B12_INJECTION]: PrescriptionInfoData.VITAMIN_B12_INJECTION,
  [GHK_CU_CREAM]: PrescriptionInfoData.GHK_CU_CREAM,
  [NAD_INJECTION]: PrescriptionInfoData.NAD_INJECTION,
  [ENCLOMIPHENE]: PrescriptionInfoData.ENCLOMIPHENE,
  [SERMORELIN_TROCHES]: PrescriptionInfoData.SERMORELIN_TROCHES,
  [TIRZEPATIDE]: PrescriptionInfoData.TIRZEPATIDE,
};

const rxCodeDisplayNames: Record<string, string> = {
  'rx-semaglutide': SEMAGLUTIDE,
  'rx-tirzepatide': TIRZEPATIDE,
  'rx-enclomiphene': ENCLOMIPHENE,
  'rx-tadalafil': TADALAFIL,
  'rx-metformin': METFORMIN,
  'rx-sermorelin-injectable': SERMORELIN_INJECTION,
  'rx-sermorelin-troche': SERMORELIN_TROCHES,
  'rx-vip-nasal-spray': VIP_NASAL_SPRAY,
  'rx-gonadorelin': GONADORELIN,
  'rx-nad-injectable': NAD_INJECTION,
  'rx-nad-intranasal': NAD_INTRANASAL,
  'rx-hcg-pregnyl': HCG,
  'rx-aloe-vera-tretinoin': TRETINOIN,
  'rx-ghk-cu': GHK_CU_CREAM,
  'rx-low-dose-naltrexone': LOW_DOSE_NALTREXONE,
  'rx-methylcobalamin-b12': VITAMIN_B12_INJECTION,
};

export const getDisplayNameFromRxCode = (
  rxCode?: string,
): string | undefined => {
  if (!rxCode) return undefined;
  return rxCodeDisplayNames[rxCode];
};

export const getPrescriptionInfo = (
  prescriptionName: string,
): PrescriptionInfo | null => {
  return prescriptionInfoMap[prescriptionName] ?? null;
};
