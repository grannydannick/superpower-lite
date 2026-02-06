import { IconCirclePerson } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCirclePerson';
import { IconEyeOpen } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconEyeOpen';
import { IconHeartBeat } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconHeartBeat';

import { CARDIOVASCULAR_PANEL } from '@/const/services';

import { usePanelPurchase } from '../../../../hooks/use-panel-purchase';
import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';
import { Detail } from '../shared';
import { PanelCTAButtons } from '../shared/panel-cta-buttons';

const BIOMARKERS = [
  {
    title: 'Lipoprotein Fractionation, NMR',
    description:
      'Advanced cholesterol testing that counts particle sizes to reveal true cardiovascular risk.',
  },
  {
    title: 'Lipoprotein (a)',
    description:
      'A genetic cholesterol particle that can triple heart attack risk, and standard tests miss it.',
  },
  {
    title: 'ADMA/SDMA',
    description:
      'When elevated, restrict blood flow and signal increased cardiovascular disease risk.',
  },
];

const WhyTakeTheTest = () => (
  <Detail.Section title="Why take the test?">
    <div className="space-y-3">
      <Detail.BulletPoint
        icon={<IconHeartBeat className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">Test Lipoprotein(a)</span> the #1
        culprit of genetic heart disease.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconEyeOpen className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">Intervene</span> to reduce risks before
        it&apos;s too late.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconCirclePerson className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">44% of Superpower members</span> catch
        early signs of heart disease.
      </Detail.BulletPoint>
    </div>
  </Detail.Section>
);

export const HeartDetail = () => {
  const { next } = useSequence();
  const { purchase, isPending, pricing } = usePanelPurchase({
    serviceName: CARDIOVASCULAR_PANEL,
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
            <Detail.ProductImage src="/onboarding/upsell/tubes/full/cardiovascular-panel.png" />
            <Detail.CuratedByResearchTeam />
          </>
        }
      >
        <Detail.Subheader
          label="Suggested based on your goals"
          pretext="One-time upgrade"
          className="px-4 md:px-0"
        >
          Cardiovascular Panel
        </Detail.Subheader>

        <div className="hidden space-y-1 px-0 md:block">
          <Detail.Pricing {...pricing} />
          <p className="text-sm text-zinc-500">
            Know your genetic risk of heart disease.
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
                Heart disease is a leading cause of death that can be prevented.
                Anyone can test their risk.
              </Detail.Section>

              <Detail.Section title="What's measured">
                Genetic markers tied to heart disease risk such as Lipoprotein
                (a). You only need to test once to know.
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
            Heart disease is a leading cause of death that can be prevented.
            Anyone can test their risk.
          </Detail.Section>

          <Detail.Section title="What's measured">
            Genetic markers tied to heart disease risk such as Lipoprotein (a).
            You only need to test once to know.
          </Detail.Section>

          <Detail.Section title="Biomarkers">
            <Detail.BiomarkerList biomarkers={BIOMARKERS} />
          </Detail.Section>
        </div>
      </Detail.ResponsiveLayout>

      <Detail.Footer className="md:hidden">
        <Detail.ServiceCard
          title="Cardiovascular Panel"
          image="/onboarding/upsell/tubes/partial/cardiovascular-panel.png"
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
