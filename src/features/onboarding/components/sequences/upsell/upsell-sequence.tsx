import { AnimatePresence, motion } from 'framer-motion';
import { ComponentType, useMemo } from 'react';

import { Head } from '@/components/seo';
import { useRecommendations } from '@/features/recommendations/api/recommendations';

import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import {
  useScreenSequence,
  SequenceProvider,
} from '../../../hooks/use-screen-sequence';
import { Sequence } from '../../sequence';

import { IntroStep } from './intro-step';
import { OutroStep } from './outro-step';
import {
  HeartPreview,
  HeartDetail,
  FertilityPreview,
  FertilityDetail,
  MetabolicPreview,
  MetabolicDetail,
  NutrientsPreview,
  NutrientsDetail,
  AutoimmunePreview,
  AutoimmuneDetail,
  MethylationPreview,
  MethylationDetail,
  GutMicrobiomePreview,
  GutMicrobiomeDetail,
} from './panels';

const FADE_TRANSITION = { duration: 0.2 };

/** Maximum number of recommended panels to show (excluding gut, which is always shown). */
const MAX_RECOMMENDED_PANELS = 2;

/**
 * Maps checkout product ID prefixes to panel IDs.
 * Product IDs from the recommendations API include version suffixes
 * (e.g. "v2-cardiovascular-bundle-20250929"), so we match by prefix.
 */
const PRODUCT_ID_PREFIX_TO_PANEL_ID: Record<string, string> = {
  'v2-cardiovascular-bundle': 'heart',
  'v2-fertility-bundle': 'fertility',
  'v2-metabolic-bundle': 'metabolic',
  'v2-nutrients-bundle': 'nutrients',
  'v2-autoimmunity-bundle': 'autoimmune',
  'v2-methylation-bundle': 'methylation',
  'gut-microbiome-analysis': 'gut-microbiome',
};

type PanelStep = {
  id: string;
  preview: ComponentType;
  detail: ComponentType;
};

const ALL_PANEL_STEPS: PanelStep[] = [
  { id: 'heart', preview: HeartPreview, detail: HeartDetail },
  { id: 'fertility', preview: FertilityPreview, detail: FertilityDetail },
  { id: 'metabolic', preview: MetabolicPreview, detail: MetabolicDetail },
  { id: 'nutrients', preview: NutrientsPreview, detail: NutrientsDetail },
  { id: 'autoimmune', preview: AutoimmunePreview, detail: AutoimmuneDetail },
  { id: 'methylation', preview: MethylationPreview, detail: MethylationDetail },
  {
    id: 'gut-microbiome',
    preview: GutMicrobiomePreview,
    detail: GutMicrobiomeDetail,
  },
];

export const UpsellSequence = () => {
  const { next: exitSequence, prev: exitBack } = useOnboardingNavigation();
  const { data: recommendations } = useRecommendations();

  const steps = useMemo(() => {
    const panelMap = new Map(ALL_PANEL_STEPS.map((p) => [p.id, p]));

    // Resolve recommended product IDs to panel IDs, preserving recommendation order
    const recommendedPanelIds: string[] = [];
    for (const product of recommendations?.products ?? []) {
      const prefix = Object.keys(PRODUCT_ID_PREFIX_TO_PANEL_ID).find((key) =>
        product.productId.startsWith(key),
      );
      if (prefix) {
        recommendedPanelIds.push(PRODUCT_ID_PREFIX_TO_PANEL_ID[prefix]);
      }
    }

    // Take top N recommendations, then ensure gut-microbiome is always included
    const panelIdsToShow = recommendedPanelIds.slice(0, MAX_RECOMMENDED_PANELS);
    if (!panelIdsToShow.includes('gut-microbiome')) {
      panelIdsToShow.push('gut-microbiome');
    }

    // Build panel steps in recommendation order
    const selectedPanels = panelIdsToShow
      .map((id) => panelMap.get(id))
      .filter((panel): panel is PanelStep => panel !== undefined);

    return [
      IntroStep,
      ...selectedPanels.flatMap((panel) => [panel.preview, panel.detail]),
      OutroStep,
    ];
  }, [recommendations]);

  const { Screen, screenIndex, sequenceValue } = useScreenSequence({
    screens: steps,
    onComplete: exitSequence,
    onBack: exitBack,
  });

  return (
    <SequenceProvider value={sequenceValue}>
      <Head title="Build Your Testing Plan" />
      <Sequence.Layout>
        <AnimatePresence mode="wait">
          <motion.div
            key={screenIndex}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE_TRANSITION}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </Sequence.Layout>
    </SequenceProvider>
  );
};
