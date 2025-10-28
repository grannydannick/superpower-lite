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
  TRETINOIN,
  VIP_NASAL_SPRAY,
  VITAMIN_B12_INJECTION,
} from '@/const';
import {
  CLINIC_PRODUCT_BASE_URL,
  PRESCRIPTION_SLUGS,
} from '@/const/prescriptions';

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
  FallbackImage: '/rx/prescription-empty.png',
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

    default:
      return prescriptionImages.FallbackImage;
  }
};

export const getProductLink = (prescriptionName?: string | null) => {
  if (!prescriptionName) return null;

  const slug = PRESCRIPTION_SLUGS[prescriptionName];
  if (!slug) return null;

  return `${CLINIC_PRODUCT_BASE_URL}/${slug}`;
};

export const navigateToProduct = (prescriptionName?: string | null) => {
  const link = getProductLink(prescriptionName);
  if (!link) return false;
  if (typeof window === 'undefined') return false;

  window.open(link, '_blank', 'noopener,noreferrer');
  return true;
};
