import { IconCirclePerson } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCirclePerson';
import { IconEyeOpen } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconEyeOpen';
import { IconHeartBeat } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconHeartBeat';

import { GUT_MICROBIOME_ANALYSIS } from '@/const/services';

import { usePanelPurchase } from '../../../../hooks/use-panel-purchase';
import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';
import { Detail } from '../shared';
import { PanelCTAButtons } from '../shared/panel-cta-buttons';

const BIOMARKERS = [
  {
    title: 'Microbiome Diversity',
    description: 'Overall diversity score — higher is generally healthier',
  },
  {
    title: 'Beneficial Bacteria',
    description: 'Levels of health-promoting species like Akkermansia',
  },
  {
    title: 'Pathogenic Bacteria',
  },
  {
    title: 'Short-Chain Fatty Acids',
  },
];

const WhyTakeTheTest = () => (
  <Detail.Section title="Why take the test?">
    <div className="space-y-3">
      <Detail.BulletPoint
        icon={<IconHeartBeat className="size-5 text-vermillion-900" />}
      >
        Measure the good and bad bacteria shaping your gut health.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconEyeOpen className="size-5 text-vermillion-900" />}
      >
        Identify imbalances driving issues in areas like digestion, skin health,
        and energy.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconCirclePerson className="size-5 text-vermillion-900" />}
      >
        Get targeted nutrition and supplement guidance based on your gut
        profile.
      </Detail.BulletPoint>
    </div>
  </Detail.Section>
);

export const GutMicrobiomeDetail = () => {
  const { next } = useSequence();
  const { purchase, isPending, pricing } = usePanelPurchase({
    serviceName: GUT_MICROBIOME_ANALYSIS,
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
            <Detail.ProductImage src="/onboarding/upsell/test-kits/gut-microbiome.webp" />
            <Detail.CuratedByResearchTeam />
          </>
        }
      >
        <Detail.Subheader pretext="One-time add-on" className="px-4 md:px-0">
          Understand your microbiome to improve whole-body health
        </Detail.Subheader>

        <div className="hidden space-y-1 px-0 md:block">
          <Detail.Pricing {...pricing} />
          <p className="text-sm text-zinc-500">
            Get the full picture of health.
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
                  Anyone with digestive concerns, skin issues, or low energy -
                  or who wants a deeper, whole-body view beyond bloodwork.
                </p>
              </Detail.Section>

              <Detail.Section title="What's measured">
                Analyzes over 100k beneficial and harmful gut bacteria to
                measure balance, diversity, and overall gut health.
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
              Anyone with digestive concerns, skin issues, or low energy - or
              who wants a deeper, whole-body view beyond bloodwork.
            </p>
          </Detail.Section>

          <Detail.Section title="What's measured">
            Analyzes over 100k beneficial and harmful gut bacteria to measure
            balance, diversity, and overall gut health.
          </Detail.Section>

          <Detail.Section title="Biomarkers">
            <Detail.BiomarkerList biomarkers={BIOMARKERS} />
          </Detail.Section>
        </div>
      </Detail.ResponsiveLayout>

      <Detail.Footer className="md:hidden">
        <Detail.ServiceCard
          title="Gut Microbiome Panel"
          image="/onboarding/upsell/test-kits/gut-microbiome.webp"
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
