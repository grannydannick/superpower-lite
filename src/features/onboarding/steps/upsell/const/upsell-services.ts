import { SERVICE_DETAILS } from '@/const/service-details';
import {
  GRAIL_GALLERI_MULTI_CANCER_TEST,
  GUT_MICROBIOME_ANALYSIS,
  TOTAL_TOXIN_TEST,
} from '@/const/services';
import { ServiceDetails } from '@/types/service';

type UpsellCover = {
  title: string;
  femaleTitle?: string; // for conditional titles in the cover
  description: string;
  circularProgress: number;
  source: string;
  foregroundImage: string;
  backgroundImage: string;
};

type UpsellService = {
  order: number;
  cover: UpsellCover;
  item: ServiceDetails & {
    name: string;
    image: string;
  };
};

// we're backfilling the upsell services with more details and add covers to each item
export const UPSELL_SERVICES = [
  {
    order: 1,
    cover: {
      title:
        'Up to 40% of healthy adults show signs of gut microbiome imbalance.',
      description:
        'This doesn’t always cause digestive symptoms, but it can lead to issues like fatigue, skin conditions, or mood disorders over time.',
      circularProgress: 0.4,
      source: 'NIH Human Microbiome Project',
      foregroundImage: '/onboarding/upsell/gut-microbiome-test-foreground.webp',
      backgroundImage: '/onboarding/upsell/gut-microbiome-test-background.webp',
    },
    item: {
      tag: 'Most popular',
      name: GUT_MICROBIOME_ANALYSIS,
      image: '/services/transparent/gut_microbiome_analysis.png',
      ...SERVICE_DETAILS[GUT_MICROBIOME_ANALYSIS],
    },
  },
  {
    order: 2,
    cover: {
      title:
        'Over 90% of people have hormone-disrupting plastics in their blood.',
      description:
        'This doesn’t always cause digestive symptoms, but it can lead to issues like fatigue, skin conditions, or mood disorders over time.',
      circularProgress: 0.9,
      source: 'Endocrine Society, 2022',
      foregroundImage: '/onboarding/upsell/total-toxin-test-foreground.webp',
      backgroundImage: '/onboarding/upsell/total-toxin-test-background.webp',
    },
    item: {
      name: TOTAL_TOXIN_TEST,
      image: '/services/transparent/total_toxin_test.png',
      ...SERVICE_DETAILS[TOTAL_TOXIN_TEST],
    },
  },
  {
    order: 3,
    cover: {
      title: '1 in 2 men will develop cancer in their lifetime.',
      femaleTitle: '1 in 2 women will develop cancer in their lifetime.',
      description:
        'The Grail Galleri test screens for over 50 types of cancer before symptoms appear, using a single blood draw. If caught early, outcomes improve dramatically.',
      circularProgress: 0.5,
      source: 'JAMA, 2018 (Genome Sequencing Screening Study)',
      foregroundImage:
        '/onboarding/upsell/grail-galleri-multi-cancer-test-foreground.webp',
      backgroundImage:
        '/onboarding/upsell/grail-galleri-multi-cancer-test-background.webp',
    },
    item: {
      name: GRAIL_GALLERI_MULTI_CANCER_TEST,
      image: '/services/transparent/grail_galleri_multi_cancer_test.png',
      ...SERVICE_DETAILS[GRAIL_GALLERI_MULTI_CANCER_TEST],
    },
  },
] as UpsellService[];
