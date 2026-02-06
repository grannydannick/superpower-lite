import { IconCirclePerson } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCirclePerson';
import { IconEyeOpen } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconEyeOpen';
import { IconHeartBeat } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconHeartBeat';

import { NUTRIENT_AND_ANTIOXIDANT_PANEL } from '@/const/services';

import { usePanelPurchase } from '../../../../hooks/use-panel-purchase';
import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';
import { Detail } from '../shared';
import { PanelCTAButtons } from '../shared/panel-cta-buttons';

const BIOMARKERS = [
  {
    title: 'Vitamin C',
    description:
      'An antioxidant vital for immune function, collagen production, and tissue repair.',
  },
  {
    title: 'Vitamin B12 (Cobalamin) and Folate Panel, Serum',
    description:
      'Essential vitamins for energy production, brain function, and healthy red blood cells.',
  },
  {
    title: 'Vitamin E (Tocopherol)',
    description:
      'A fat-soluble antioxidant protecting cells from damage and supporting immune health.',
  },
  {
    title: 'Vitamin K',
    description:
      'Essential for blood clotting and helping direct calcium into bones, not arteries.',
  },
  {
    title: 'Magnesium, RBC',
    description:
      'A mineral critical for muscle function, sleep quality, and stress response.',
  },
  {
    title: 'Selenium',
    description:
      'A trace mineral supporting thyroid function, immunity, and antioxidant defense.',
  },
];

const WhyTakeTheTest = () => (
  <Detail.Section title="Why take the test?">
    <div className="space-y-3">
      <Detail.BulletPoint
        icon={<IconHeartBeat className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">Detect common gaps</span> in
        micronutrients that quietly affect energy, recovery, and resilience.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconEyeOpen className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">See if your diet</span> fully supports
        your nutrients.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconCirclePerson className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">Most of the population</span> are
        micronutrient deficient. 95% vitamin D deficient, 84% vitamin E and 46%
        vitamin C.
      </Detail.BulletPoint>
    </div>
  </Detail.Section>
);

export const NutrientsDetail = () => {
  const { next } = useSequence();
  const { purchase, isPending, pricing } = usePanelPurchase({
    serviceName: NUTRIENT_AND_ANTIOXIDANT_PANEL,
    onSuccess: next,
    onError: next,
    onUnavailable: next,
  });

  return (
    <Sequence.StepLayout fullHeight className="bg-zinc-50 md:bg-white">
      <Detail.Header />

      <Detail.ResponsiveLayout
        leftContent={
          <>
            <Detail.ProductImage src="/onboarding/upsell/tubes/full/nutrient-panel.png" />
            <Detail.CuratedByResearchTeam />
          </>
        }
      >
        <Detail.Subheader
          label="Suggested based on your goals"
          pretext="One-time upgrade"
          className="px-4 md:px-0"
        >
          Nutrients Panel
        </Detail.Subheader>

        <div className="hidden space-y-1 px-0 md:block">
          <Detail.Pricing {...pricing} />
          <p className="text-sm text-zinc-500">
            See what&apos;s missing from feeling your best
          </p>
        </div>

        <div className="hidden space-y-8 py-6 md:block">
          <WhyTakeTheTest />
          <PanelCTAButtons
            price={pricing.totalPrice}
            isPending={isPending}
            onOrder={purchase}
            onSkip={next}
          />
        </div>

        <Detail.Tabs>
          <Detail.TabList />

          <Detail.TabPanel value="overview">
            <Detail.Content className="space-y-8">
              <WhyTakeTheTest />

              <Detail.Section title="Who is this for?">
                <p>
                  Anyone can test their micronutrients to verify their
                  nutritional foundations from their diet.
                </p>
                <p className="mt-2">
                  This test can also identify gaps to anyone feeling lower
                  energy or slow recovery than expected.
                </p>
              </Detail.Section>

              <Detail.Section title="What's measured">
                Essential vitamins and minerals involved in energy, recovery,
                immune function, and cellular repair.
              </Detail.Section>
            </Detail.Content>
          </Detail.TabPanel>

          <Detail.TabPanel value="biomarkers">
            <Detail.Content>
              <Detail.Section title="Biomarkers">
                <Detail.BiomarkerList biomarkers={BIOMARKERS} />
              </Detail.Section>
            </Detail.Content>
          </Detail.TabPanel>
        </Detail.Tabs>

        <div className="hidden flex-1 space-y-8 overflow-y-auto py-8 md:block">
          <Detail.Section title="Who is this for?">
            <p>
              Anyone can test their micronutrients to verify their nutritional
              foundations from their diet.
            </p>
            <p className="mt-2">
              This test can also identify gaps to anyone feeling lower energy or
              slow recovery than expected.
            </p>
          </Detail.Section>

          <Detail.Section title="What's measured">
            Essential vitamins and minerals involved in energy, recovery, immune
            function, and cellular repair.
          </Detail.Section>

          <Detail.Section title="Biomarkers">
            <Detail.BiomarkerList biomarkers={BIOMARKERS} />
          </Detail.Section>
        </div>
      </Detail.ResponsiveLayout>

      <Detail.Footer className="md:hidden">
        <Detail.ServiceCard
          title="Nutrients Panel"
          image="/onboarding/upsell/tubes/partial/nutrient-panel.png"
          {...pricing}
        />
        <PanelCTAButtons
          price={pricing.totalPrice}
          isPending={isPending}
          onOrder={purchase}
          onSkip={next}
        />
      </Detail.Footer>
    </Sequence.StepLayout>
  );
};
