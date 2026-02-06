import { ORGAN_AGE_PANEL } from '@/const/services';

import { usePanelPurchase } from '../../../../hooks/use-panel-purchase';
import { useSequence } from '../../../../hooks/use-screen-sequence';
import { Sequence } from '../../../sequence';
import { Detail } from '../shared';
import { PanelCTAButtons } from '../shared/panel-cta-buttons';

const BIOMARKERS = [
  {
    title: 'Cognitive Age (Brain)',
    description:
      'See how stress, sleep, and inflammation are aging your brain before performance drops',
  },
  {
    title: 'Circulatory Age (Heart & Vessels)',
    description: 'Understand how hard your heart is working',
  },
  {
    title: 'Liver Age',
    description:
      'Detect early detox strain before it shows up as fatigue or weight gain',
  },
  {
    title: 'Respiratory Age (Lungs)',
    description:
      'See whether your oxygen capacity is quietly limiting energy and endurance',
  },
  {
    title: 'Metabolic Age',
    description:
      'See how efficiently your body uses energy and your risks of diabetes',
  },
  {
    title: 'Infectious / Immune Age',
    description: 'Understand how quickly you recover and fight back disease',
  },
  {
    title: 'Genitourinary Age (Kidney)',
    description: 'Understand how hard your kidneys are working',
  },
];

export const OrganAgeDetail = () => {
  const { next } = useSequence();
  const { purchase, isPending, pricing } = usePanelPurchase({
    serviceName: ORGAN_AGE_PANEL,
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
            <Detail.ProductImage src="/onboarding/upsell/tubes/full/organ-age-panel.webp" />
            <Detail.CuratedByResearchTeam />
          </>
        }
      >
        <Detail.Subheader pretext="One-time upgrade" className="px-4 md:px-0">
          Calculate your OrganAge
        </Detail.Subheader>

        <div className="hidden space-y-2 px-0 md:block">
          <Detail.PoweredByBadge>
            <img
              src="/onboarding/shared/branding/cosmica-logo.webp"
              alt="Cosmica"
              className="h-3.5 opacity-50"
            />
          </Detail.PoweredByBadge>
          <Detail.Pricing {...pricing} />
        </div>

        <div className="hidden space-y-2 py-4 md:block">
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
              <Detail.Section title="What's included">
                <p>
                  A calculation of how 9 different organ systems of your body
                  are aging and how to reverse them.
                </p>
                <p className="mt-2">
                  Powered by Cosmica Bio, OrganAge is trained on 1000s of data
                  sets to link your organ age with longevity and disease risk.
                </p>
              </Detail.Section>

              <Detail.Section title="Who is this for?">
                <p>
                  Anyone who wants to understand how their body is actually
                  aging, not just how old they are.
                </p>
                <p className="mt-2">
                  Especially useful if you feel &quot;off,&quot; are under
                  chronic stress, or want to be proactive about your health.
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
          <Detail.Section title="What's included">
            <p>
              A calculation of how 9 different organ systems of your body are
              aging and how to reverse them.
            </p>
            <p className="mt-2">
              Powered by Cosmica Bio, OrganAge is trained on 1000s of data sets
              to link your organ age with longevity and disease risk.
            </p>
          </Detail.Section>

          <Detail.Section title="Who is this for?">
            <p>
              Anyone who wants to understand how their body is actually aging,
              not just how old they are.
            </p>
            <p className="mt-2">
              Especially useful if you feel &quot;off,&quot; are under chronic
              stress, or want to be proactive about your health.
            </p>
          </Detail.Section>

          <Detail.Section title="Biomarkers">
            <Detail.BiomarkerList biomarkers={BIOMARKERS} />
          </Detail.Section>
        </div>
      </Detail.ResponsiveLayout>

      <Detail.Footer className="md:hidden">
        <Detail.ServiceCard
          title="Calculate your OrganAge"
          image="/onboarding/upsell/tubes/partial/organ-age-panel.png"
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
