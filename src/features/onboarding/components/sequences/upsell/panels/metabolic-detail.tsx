import { IconCirclePerson } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCirclePerson';
import { IconEyeOpen } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconEyeOpen';
import { IconHeartBeat } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconHeartBeat';

import { METABOLIC_PANEL } from '@/const/services';

import { usePanelPurchase } from '../../../../hooks/use-panel-purchase';
import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';
import { Detail } from '../shared';
import { PanelCTAButtons } from '../shared/panel-cta-buttons';

const BIOMARKERS = [
  {
    title: 'Adiponectin',
    description:
      'A hormone from fat cells that protects against diabetes and heart disease.',
  },
  {
    title: 'Leptin',
    description:
      'The satiety hormone that regulates appetite, metabolism, and body weight.',
  },
  {
    title: 'Cardio IQ Insulin Resistance Panel with Score',
    description:
      'Comprehensive assessment of how efficiently your body uses insulin for energy.',
  },
  {
    title: 'Fructosamine',
    description:
      'Shows average blood sugar over two weeks, useful for short-term monitoring.',
  },
];

const WhyTakeTheTest = () => (
  <Detail.Section title="Why take the test?">
    <div className="space-y-3">
      <Detail.BulletPoint
        icon={<IconHeartBeat className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">Test insulin resistance</span> early
        before it progresses to diabetes or heart disease.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconEyeOpen className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">Understand</span> hunger signals and how
        your body stores fat.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconCirclePerson className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">1 in 3 U.S. adults</span> have metabolic
        syndrome which raises diabetes risk but is preventable.
      </Detail.BulletPoint>
    </div>
  </Detail.Section>
);

export const MetabolicDetail = () => {
  const { next } = useSequence();
  const { purchase, isPending, pricing } = usePanelPurchase({
    serviceName: METABOLIC_PANEL,
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
            <Detail.ProductImage src="/onboarding/upsell/tubes/full/metabolic-panel.png" />
            <Detail.CuratedByResearchTeam />
          </>
        }
      >
        <Detail.Subheader
          label="Suggested based on your goals"
          pretext="One-time upgrade"
          className="px-4 md:px-0"
        >
          Metabolic Panel
        </Detail.Subheader>

        <div className="hidden space-y-1 px-0 md:block">
          <Detail.Pricing {...pricing} />
          <p className="text-sm text-zinc-500">
            Understand how your metabolism is functioning.
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
                  Anyone looking to protect long-term metabolic health. Early
                  insight can preserve performance over years.
                </p>
                <p className="mt-2">
                  Individuals feeling fatigue, weight resistance, brain fog can
                  also better understand their symptoms.
                </p>
              </Detail.Section>

              <Detail.Section title="What's measured">
                <p>
                  Test how efficiently your body stores and uses energy and
                  manages glucose.
                </p>
                <p className="mt-2">
                  Assess upstream metabolic dysfunction that standard glucose
                  and A1C labs miss.
                </p>
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
              Anyone looking to protect long-term metabolic health. Early
              insight can preserve performance over years.
            </p>
            <p className="mt-2">
              Individuals feeling fatigue, weight resistance, brain fog can also
              better understand their symptoms.
            </p>
          </Detail.Section>

          <Detail.Section title="What's measured">
            <p>
              Test how efficiently your body stores and uses energy and manages
              glucose.
            </p>
            <p className="mt-2">
              Assess upstream metabolic dysfunction that standard glucose and
              A1C labs miss.
            </p>
          </Detail.Section>

          <Detail.Section title="Biomarkers">
            <Detail.BiomarkerList biomarkers={BIOMARKERS} />
          </Detail.Section>
        </div>
      </Detail.ResponsiveLayout>

      <Detail.Footer className="md:hidden">
        <Detail.ServiceCard
          title="Metabolic Panel"
          image="/onboarding/upsell/tubes/partial/metabolic-panel.png"
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
