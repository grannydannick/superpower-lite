import { IconCirclePerson } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCirclePerson';
import { IconEyeOpen } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconEyeOpen';
import { IconHeartBeat } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconHeartBeat';

import { METHYLATION_PANEL } from '@/const/services';

import { usePanelPurchase } from '../../../../hooks/use-panel-purchase';
import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';
import { Detail } from '../shared';
import { PanelCTAButtons } from '../shared/panel-cta-buttons';

const BIOMARKERS = [
  {
    title: 'Homocysteine',
    description:
      'An amino acid linked to heart disease and cognitive decline when elevated.',
  },
  {
    title: 'Methylmalonic Acid',
    description:
      'A sensitive marker detecting B12 deficiency before standard tests show problems.',
  },
  {
    title: 'Folate, RBC',
    description:
      'Measures long-term folate status, essential for DNA synthesis and cell division.',
  },
  {
    title: 'Vitamin B6, Plasma',
    description:
      'Supports brain function, mood regulation, and over 100 enzyme reactions.',
  },
  {
    title: 'Vitamin B12 (Cobalamin)',
    description:
      'Critical for nerve health, energy production, and red blood cell formation.',
  },
];

const WhyTakeTheTest = () => (
  <Detail.Section title="Why take the test?">
    <div className="space-y-3">
      <Detail.BulletPoint
        icon={<IconHeartBeat className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">
          1 in 3 people have genetic differences
        </span>{' '}
        that impact methylation.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconEyeOpen className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">When methylation is slow,</span> it
        affects energy, focus, and healthy aging.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconCirclePerson className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">
          Results can point to simple, targeted adjustments
        </span>{' '}
        in vitamin B or magnesium.
      </Detail.BulletPoint>
    </div>
  </Detail.Section>
);

export const MethylationDetail = () => {
  const { next } = useSequence();
  const { purchase, isPending, pricing } = usePanelPurchase({
    serviceName: METHYLATION_PANEL,
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
            <Detail.ProductImage src="/onboarding/upsell/tubes/full/methylation-panel.png" />
            <Detail.CuratedByResearchTeam />
          </>
        }
      >
        <Detail.Subheader
          label="Suggested based on your goals"
          pretext="One-time upgrade"
          className="px-4 md:px-0"
        >
          Methylation Panel
        </Detail.Subheader>

        <div className="hidden space-y-1 px-0 md:block">
          <Detail.Pricing {...pricing} />
          <p className="text-sm text-zinc-500">
            Understand how your body processes key nutrients.
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
                <p>Anyone experiencing fatigue, brain fog, or mood changes.</p>
                <p className="mt-2">
                  Anyone who wants deeper insight into how their body processes
                  nutrients for long-term health and aging.
                </p>
              </Detail.Section>

              <Detail.Section title="What's measured">
                How well your body uses essential B vitamins involved in energy,
                recovery, immune function, and cellular repair.
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
            <p>Anyone experiencing fatigue, brain fog, or mood changes.</p>
            <p className="mt-2">
              Anyone who wants deeper insight into how their body processes
              nutrients for long-term health and aging.
            </p>
          </Detail.Section>

          <Detail.Section title="What's measured">
            How well your body uses essential B vitamins involved in energy,
            recovery, immune function, and cellular repair.
          </Detail.Section>

          <Detail.Section title="Biomarkers">
            <Detail.BiomarkerList biomarkers={BIOMARKERS} />
          </Detail.Section>
        </div>
      </Detail.ResponsiveLayout>

      <Detail.Footer className="md:hidden">
        <Detail.ServiceCard
          title="Methylation Panel"
          image="/onboarding/upsell/tubes/partial/methylation-panel.png"
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
