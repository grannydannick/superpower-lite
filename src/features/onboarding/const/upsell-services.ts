import { SERVICE_DETAILS } from '@/const/service-details';
import {
  GUT_MICROBIOME_ANALYSIS,
  ENVIRONMENTAL_TOXIN_TEST,
} from '@/const/services';
import { ServiceDetails } from '@/types/service';

type UpsellCover = {
  title: string;
  femaleTitle?: string; // for conditional titles in the cover
  description: string;
  circularProgress: number;
  source: string;
  foregroundImage: string;
  femaleForegroundImage?: string; // for conditional foreground images in the cover
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
      name: ENVIRONMENTAL_TOXIN_TEST,
      image: '/services/transparent/total_toxin_test.png',
      ...SERVICE_DETAILS[ENVIRONMENTAL_TOXIN_TEST],
    },
  },
] as UpsellService[];
