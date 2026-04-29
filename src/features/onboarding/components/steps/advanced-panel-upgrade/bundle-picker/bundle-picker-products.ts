import {
  ADVANCED_UPGRADE_BUNDLE_IDS,
  type AdvancedUpgradeBundleId,
} from '@/const';
import { GUT_MICROBIOME_ANALYSIS_ID } from '@/const/services';
import type { OnboardingProduct } from '@/features/onboarding/api/onboarding-products';
import type { User } from '@/types/api';
import { isNYNJUser } from '@/utils/get-upgrade-price';

import {
  ADVANCED_PANEL_IMAGE,
  ENVIRONMENTAL_TOXINS_IMAGE,
  GUT_MICROBIOME_IMAGE,
  HEAVY_METALS_IMAGE,
  MYCOTOXINS_IMAGE,
} from './bundle-picker-assets';

export interface BundleMarketingCopy {
  id: AdvancedUpgradeBundleId;
  cardTitle: string;
  footerLabel: string;
  recommended?: boolean;
}

export interface BundleUnlockCopy {
  lead: string;
  body: string;
}

export interface BundleGenderCopyInput {
  gender: 'male' | 'female' | undefined;
}

export interface AdvancedIncludedSection {
  kind: 'advanced';
  accordionValue: string;
  eyebrow: string;
  title: string;
  summaryLine: string;
  product: OnboardingProduct;
}

export interface ServiceIncludedSection {
  kind: 'service';
  accordionValue: string;
  slug: string;
  eyebrow: string;
  title: string;
  summaryLine: string;
  product: OnboardingProduct;
}

export type IncludedSection = AdvancedIncludedSection | ServiceIncludedSection;

const BUNDLE_CARD_META: Record<
  AdvancedUpgradeBundleId,
  { cardTitle: string; footerLabel: string; recommended?: boolean }
> = {
  [ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE]: {
    cardTitle: 'Male Advanced',
    footerLabel: 'Male Advanced',
  },
  [ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE]: {
    cardTitle: 'Advanced & Microbiome',
    footerLabel: 'Advanced & Microbiome',
    recommended: true,
  },
  [ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE]: {
    cardTitle: 'Complete Bundle',
    footerLabel: 'Complete Bundle',
  },
};

function getAdvancedPanelTitle(input: BundleGenderCopyInput) {
  if (input.gender === 'female') {
    return 'Female Advanced Panel';
  }

  return 'Male Advanced Panel';
}

function getAdvancedBundleTitle(input: BundleGenderCopyInput) {
  if (input.gender === 'female') {
    return 'Female Advanced';
  }

  return 'Male Advanced';
}

function getAdvancedPanelSummaryLine(input: BundleGenderCopyInput) {
  if (input.gender === 'female') {
    return ADVANCED_PANEL_SUMMARY_LINE_BY_GENDER.female;
  }

  return ADVANCED_PANEL_SUMMARY_LINE_BY_GENDER.male;
}

const BUNDLE_UNLOCK_COPY: Record<AdvancedUpgradeBundleId, BundleUnlockCopy> = {
  [ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE]: {
    lead: 'Go beyond Baseline with 30+ added biomarkers across hormones, cardiovascular health, and metabolism.',
    body: 'Catch hidden risks earlier and get insight into energy, recovery, and long-term health.',
  },
  [ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE]: {
    lead: 'Everything in Advanced, plus a full read of the system behind digestion, immunity, mood, and metabolism.',
    body: "Your gut shapes how everything else performs - now you'll see exactly how it's running.",
  },
  [ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE]: {
    lead: 'Get a full view inside your blood, gut & environment.',
    body: "Everything in Performance, plus the exposures that quietly accumulate and drain energy, focus, and longevity - heavy metals, mold toxins, and everyday chemicals most people never measure. The most complete picture of what's driving and eroding your health.",
  },
};

const SERVICE_ID_TO_PRODUCT_SLUG: Record<string, string> = {
  [GUT_MICROBIOME_ANALYSIS_ID]: 'gut-microbiome-analysis',
};

const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  'advanced-blood-panel': ADVANCED_PANEL_IMAGE,
  'gut-microbiome-analysis': GUT_MICROBIOME_IMAGE,
  'heavy-metals': HEAVY_METALS_IMAGE,
  mycotoxins: MYCOTOXINS_IMAGE,
  'environmental-toxins': ENVIRONMENTAL_TOXINS_IMAGE,
};

const ADVANCED_PANEL_SUMMARY_LINE_BY_GENDER: Record<'male' | 'female', string> =
  {
    male: "30+ added biomarkers and urinalysis. Key markers include: Lp(a) and PSA to flag silent threats for heart disease and prostate cancer that standard tests miss, while IGF-1, free insulin, and free T3 reveal what's driving strength, metabolism, and how you feel day-to-day.",
    female:
      "30+ added biomarkers and urinalysis. Key markers include: Lp(a) and thyroid antibodies to flag silent threats - inherited heart risk and autoimmune imbalance - that standard tests miss, while AMH, progesterone, and fasting insulin reveal what's driving hormones, energy, and day-to-day health.",
  };

const PRODUCT_DETAIL_COPY_BY_SLUG: Record<
  string,
  { eyebrow: string; title: string; summaryLine: string }
> = {
  'gut-microbiome-analysis': {
    eyebrow: 'At-home, self-collected sample',
    title: 'Gut Microbiome testing',
    summaryLine:
      '100+ data points in the bacteria shaping digestion, energy, and immunity',
  },
  'heavy-metals': {
    eyebrow: 'At-home, self-collected sample',
    title: 'Heavy metals analysis',
    summaryLine:
      '20+ toxic metals that accumulate from food, water, and environment',
  },
  mycotoxins: {
    eyebrow: 'At-home, self-collected sample',
    title: 'Mycotoxins',
    summaryLine:
      '11 mold toxins from everyday foods and water-damaged buildings.',
  },
  'environmental-toxins': {
    eyebrow: 'At-home, self-collected sample',
    title: 'Environmental toxins test',
    summaryLine: '27 everyday chemicals quietly accumulating in your body',
  },
};

export function productsResponseToMap(products: OnboardingProduct[]) {
  const map = new Map<string, OnboardingProduct>();
  for (const p of products) {
    map.set(p.slug, p);
  }
  return map;
}

export function getProductBySlug(
  productBySlug: Map<string, OnboardingProduct>,
  slug: string,
) {
  return productBySlug.get(slug);
}

export function getBundleProductImageSrc(product: { slug: string }) {
  return PRODUCT_IMAGE_BY_SLUG[product.slug] ?? ADVANCED_PANEL_IMAGE;
}

function serviceSectionFromMap(
  productBySlug: Map<string, OnboardingProduct>,
  serviceId: string,
): ServiceIncludedSection | null {
  const slug = SERVICE_ID_TO_PRODUCT_SLUG[serviceId];
  if (slug == null) {
    return null;
  }
  const product = getProductBySlug(productBySlug, slug);
  if (product == null) {
    return null;
  }

  const copy = PRODUCT_DETAIL_COPY_BY_SLUG[slug];
  const eyebrow =
    copy?.eyebrow ??
    (product.subtitle != null && product.subtitle.trim().length > 0
      ? product.subtitle.trim()
      : 'Included add-on test');

  const title =
    copy?.title ??
    (product.title.trim().length > 0 ? product.title.trim() : slug);
  const summaryLine =
    copy?.summaryLine ?? product.shortDescription?.trim() ?? '';

  return {
    kind: 'service',
    accordionValue: `service-${slug}`,
    slug,
    eyebrow,
    title,
    summaryLine,
    product,
  };
}

export function buildIncludedSections(
  bundleId: AdvancedUpgradeBundleId,
  productBySlug: Map<string, OnboardingProduct>,
  input: BundleGenderCopyInput = { gender: undefined },
): IncludedSection[] {
  const sections: IncludedSection[] = [];

  const advancedProduct = getProductBySlug(
    productBySlug,
    'advanced-blood-panel',
  );
  if (advancedProduct != null) {
    sections.push({
      kind: 'advanced',
      accordionValue: 'advanced',
      eyebrow: 'Same blood draw',
      title: getAdvancedPanelTitle(input),
      summaryLine: getAdvancedPanelSummaryLine(input),
      product: advancedProduct,
    });
  }

  if (
    bundleId === ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE ||
    bundleId === ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE
  ) {
    const gut = serviceSectionFromMap(
      productBySlug,
      GUT_MICROBIOME_ANALYSIS_ID,
    );
    if (gut != null) {
      sections.push(gut);
    }
  }

  if (bundleId === ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE) {
    const toxinSlugs = ['heavy-metals', 'mycotoxins', 'environmental-toxins'];

    for (const slug of toxinSlugs) {
      const toxin = getProductBySlug(productBySlug, slug);
      if (toxin == null) {
        continue;
      }

      const copy = PRODUCT_DETAIL_COPY_BY_SLUG[slug];
      const title =
        copy?.title ??
        (toxin.title.trim().length > 0 ? toxin.title.trim() : slug);
      const summaryLine =
        copy?.summaryLine ?? toxin.shortDescription?.trim() ?? '';

      sections.push({
        kind: 'service',
        accordionValue: `service-${slug}`,
        slug,
        eyebrow: copy?.eyebrow ?? 'Included add-on test',
        title,
        summaryLine,
        product: toxin,
      });
    }
  }

  return sections;
}

export function getBundleMarketingCopy(
  bundleId: AdvancedUpgradeBundleId,
  input: BundleGenderCopyInput = { gender: undefined },
): BundleMarketingCopy {
  const meta = BUNDLE_CARD_META[bundleId];

  if (bundleId === ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE) {
    const title = getAdvancedBundleTitle(input);
    return {
      id: bundleId,
      cardTitle: title,
      footerLabel: title,
      recommended: meta.recommended,
    };
  }

  return {
    id: bundleId,
    cardTitle: meta.cardTitle,
    footerLabel: meta.footerLabel,
    recommended: meta.recommended,
  };
}

export function getBundleUnlockCopy(bundleId: AdvancedUpgradeBundleId) {
  return BUNDLE_UNLOCK_COPY[bundleId];
}

export const BUNDLE_ORDER: AdvancedUpgradeBundleId[] = [
  ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_UPGRADE,
  ADVANCED_UPGRADE_BUNDLE_IDS.ADVANCED_MICROBIOME_BUNDLE,
  ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE,
];

export function getAvailableBundleOrder(user: User | undefined) {
  const bundleOrder: AdvancedUpgradeBundleId[] = [];
  for (const bundleId of BUNDLE_ORDER) {
    if (
      isNYNJUser(user) &&
      bundleId === ADVANCED_UPGRADE_BUNDLE_IDS.COMPLETE_BUNDLE
    ) {
      continue;
    }
    bundleOrder.push(bundleId);
  }
  return bundleOrder;
}
