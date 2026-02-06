import { IconCirclePerson } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconCirclePerson';
import { IconEyeOpen } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconEyeOpen';
import { IconHeartBeat } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconHeartBeat';

import { FEMALE_FERTILITY_PANEL } from '@/const/services';

import { usePanelPurchase } from '../../../../hooks/use-panel-purchase';
import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';
import { Detail } from '../shared';
import { PanelCTAButtons } from '../shared/panel-cta-buttons';

const BIOMARKERS = [
  {
    title: 'Estradiol, Ultrasensitive, LC/MS',
    description:
      'Precise estrogen measurement for fertility assessment and hormonal balance tracking.',
  },
  {
    title: 'Progesterone, LC/MS',
    description:
      'High-precision progesterone testing for ovulation confirmation and cycle assessment.',
  },
  {
    title: 'FSH and LH',
    description:
      'Reproductive hormones that regulate fertility, ovulation, and hormonal balance.',
  },
  {
    title: 'Prolactin',
    description:
      'A pituitary hormone affecting fertility, libido, and menstrual regularity.',
  },
  {
    title: 'Anti-Mullerian Hormone (AMH), Female',
    description:
      'Measures egg reserve to help you understand your fertility timeline.',
  },
  {
    title: 'Thyroid Peroxidase and Thyroglobulin Antibodies',
    description:
      "Detects autoimmune thyroid conditions like Hashimoto's before symptoms appear.",
  },
  {
    title: 'Cardio IQ Insulin',
    description:
      'Detects insulin resistance that can disrupt ovulation and hormonal balance.',
  },
  {
    title: 'Glucose, Plasma',
    description:
      'Measures blood sugar levels to screen for diabetes and metabolic health.',
  },
  {
    title: 'Mercury, Blood',
    description:
      'Detects toxic mercury exposure that can impair fertility and fetal development.',
  },
  {
    title: '17-Hydroxyprogesterone',
    description:
      'Screens for adrenal conditions affecting hormone production and fertility.',
  },
];

const WhyTakeTheTest = () => (
  <Detail.Section title="Why take the test?">
    <div className="space-y-3">
      <Detail.BulletPoint
        icon={<IconHeartBeat className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">AMH reveals your ovarian reserve</span>{' '}
        so you know your timeline.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconEyeOpen className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">Make informed decisions</span> about
        fertility timing and egg freezing.
      </Detail.BulletPoint>
      <Detail.BulletPoint
        icon={<IconCirclePerson className="size-5 text-vermillion-900" />}
      >
        <span className="text-zinc-900">Uncover hidden factors</span> like
        thyroid and insulin issues that often go undetected.
      </Detail.BulletPoint>
    </div>
  </Detail.Section>
);

export const FertilityDetail = () => {
  const { next } = useSequence();
  const { purchase, isPending, pricing } = usePanelPurchase({
    serviceName: FEMALE_FERTILITY_PANEL,
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
            <Detail.ProductImage src="/onboarding/upsell/tubes/full/female-fertility-panel.png" />
            <Detail.CuratedByResearchTeam />
          </>
        }
      >
        <Detail.Subheader
          label="Suggested based on your goals"
          pretext="One-time upgrade"
          className="px-4 md:px-0"
        >
          Fertility Panel
        </Detail.Subheader>

        <div className="hidden space-y-1 px-0 md:block">
          <Detail.Pricing {...pricing} />
          <p className="text-sm text-zinc-500">
            Know your timeline for pregnancy.
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
                Women thinking proactively about family planning - whether
                pregnancy is on your radar now, in a few years, or you simply
                want to understand your options.
              </Detail.Section>

              <Detail.Section title="What's measured">
                Reproductive hormones, thyroid and markers like AMH which
                provide insight into ovarian reserves.
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
            Women thinking proactively about family planning - whether pregnancy
            is on your radar now, in a few years, or you simply want to
            understand your options.
          </Detail.Section>

          <Detail.Section title="What's measured">
            Reproductive hormones, thyroid and markers like AMH which provide
            insight into ovarian reserves.
          </Detail.Section>

          <Detail.Section title="Biomarkers">
            <Detail.BiomarkerList biomarkers={BIOMARKERS} />
          </Detail.Section>
        </div>
      </Detail.ResponsiveLayout>

      <Detail.Footer className="md:hidden">
        <Detail.ServiceCard
          title="Fertility Panel"
          image="/onboarding/upsell/tubes/partial/female-fertility-panel.png"
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
