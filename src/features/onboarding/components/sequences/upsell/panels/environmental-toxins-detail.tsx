import { IconCirclePerson } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCirclePerson';
import { IconEyeOpen } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconEyeOpen';
import { IconHeartBeat } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconHeartBeat';

import { ENVIRONMENTAL_TOXINS_TEST } from '@/const/services';

import { usePanelPurchase } from '../../../../hooks/use-panel-purchase';
import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';
import { Detail } from '../shared';
import { PanelCTAButtons } from '../shared/panel-cta-buttons';

const BIOMARKERS = [
  {
    title: 'Phthalates',
    description: 'Plasticizers found in everyday products affecting hormones',
  },
  {
    title: 'Parabens',
    description: 'Preservatives linked to endocrine disruption',
  },
  {
    title: 'BPA/BPS',
  },
  {
    title: 'Organophosphates',
  },
];

const WhyTakeTheTest = () => (
  <Detail.Section title="Why take the test?">
    <div className="space-y-3">
      <Detail.BulletPoint
        icon={<IconHeartBeat className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">
          Measure toxins your body is exposed to
        </span>{' '}
        from air, water, and products.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconEyeOpen className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">
          Environmental toxins aren&apos;t routinely screened
        </span>
        , even with symptoms.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconCirclePerson className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">
          Knowing what you&apos;re exposed to
        </span>{' '}
        helps reduce load before it compounds.
      </Detail.BulletPoint>
    </div>
  </Detail.Section>
);

export const EnvironmentalToxinsDetail = () => {
  const { next } = useSequence();
  const { purchase, isPending, pricing } = usePanelPurchase({
    serviceName: ENVIRONMENTAL_TOXINS_TEST,
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
            <Detail.ProductImage src="/services/transparent/environmental_toxin_test.png" />
            <Detail.CuratedByResearchTeam />
          </>
        }
      >
        <Detail.Subheader
          label="Suggested based on your goals"
          pretext="One-time upgrade"
          className="px-4 md:px-0"
        >
          Environmental Toxins Test
        </Detail.Subheader>

        <div className="hidden space-y-1 px-0 md:block">
          <Detail.Pricing {...pricing} />
          <p className="text-sm text-zinc-500">
            Understand your environmental burden.
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
                  Anyone with unexplained fatigue, hormone changes, or metabolic
                  concerns - or those wanting a clearer picture of environmental
                  influences on health.
                </p>
              </Detail.Section>

              <Detail.Section title="What's measured">
                <p>
                  Markers of environmental chemical exposure linked to endocrine
                  signaling, detoxification pathways, and nervous system stress.
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
              Anyone with unexplained fatigue, hormone changes, or metabolic
              concerns - or those wanting a clearer picture of environmental
              influences on health.
            </p>
          </Detail.Section>

          <Detail.Section title="What's measured">
            <p>
              Markers of environmental chemical exposure linked to endocrine
              signaling, detoxification pathways, and nervous system stress.
            </p>
          </Detail.Section>

          <Detail.Section title="Biomarkers">
            <Detail.BiomarkerList biomarkers={BIOMARKERS} />
          </Detail.Section>
        </div>
      </Detail.ResponsiveLayout>

      <Detail.Footer className="md:hidden">
        <Detail.ServiceCard
          title="Environmental Toxins Test"
          image="/services/transparent/environmental_toxin_test.png"
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
