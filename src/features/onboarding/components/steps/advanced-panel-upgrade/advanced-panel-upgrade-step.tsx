import { IconEyeOpen } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconEyeOpen';
import { IconHeartBeat } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconHeartBeat';
import { IconPersona } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconPersona';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { Head } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { useUpgradeCredit } from '@/features/orders/api';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import { useGender } from '@/hooks/use-gender';
import { useUser } from '@/lib/auth';
import { formatMoney } from '@/utils/format-money';
import { getUpgradePrice } from '@/utils/get-upgrade-price';

import { useOnboardingAnalytics } from '../../../hooks/use-onboarding-analytics';
import { useOnboardingNavigation } from '../../../hooks/use-onboarding-navigation';
import { Sequence } from '../../sequence';
import { Detail } from '../../sequences/upsell/shared/detail';

import {
  ADVANCED_PANEL_FEMALE_BIOMARKERS,
  ADVANCED_PANEL_MALE_BIOMARKERS,
} from './advanced-panel-biomarkers';

const TESTIMONIALS = [
  {
    name: 'Michael S.',
    rating: 5,
    text: "I felt really good about my health. I work out four times a week. My results showed elevated Lp(a), a genetic factor of heart disease that can't be changed by diet and exercise.\n\nWithout Superpower I would still be going down the path I was unaware of.",
  },
  {
    name: 'Carissa K.',
    rating: 5,
    text: "I purchased the advanced lab test from Superpower, and after getting my results, I used Superpower to work through my top results and action items. I've been feeling better for weeks now. More energy, less bloating and weight gain has gone down.",
  },
  {
    name: 'Danielle H.',
    rating: 5,
    text: "I was dealing with heart palpitations, mood swings, difficulty focusing, and forgetfulness. Turns out I was dealing with Hashimoto's disease.",
  },
];

const WHY_TAKE_THE_TEST_BULLETS = {
  male: [
    {
      icon: <IconHeartBeat className="size-5 text-vermillion-900" />,
      highlight: 'Uncover hidden risk for heart disease',
      trailing: 'and prostate cancer.',
    },
    {
      icon: <IconEyeOpen className="size-5 text-vermillion-900" />,
      highlight: 'Go beyond testosterone',
      trailing:
        'to understand the signals driving libido, motivation, and energy.',
    },
    {
      icon: <IconPersona className="size-5 text-vermillion-900" />,
      highlight: 'Measure metabolic health',
      trailing: 'and how your body processes energy, sugar, and fat.',
    },
  ],
  female: [
    {
      icon: <IconHeartBeat className="size-5 text-vermillion-900" />,
      highlight: 'Uncover hidden risk for heart disease',
      trailing: 'and breast cancer.',
    },
    {
      icon: <IconEyeOpen className="size-5 text-vermillion-900" />,
      highlight: 'Go beyond estrogen and progesterone',
      trailing:
        'to understand the signals driving mood, energy, and cycle health.',
    },
    {
      icon: <IconPersona className="size-5 text-vermillion-900" />,
      highlight: 'Measure metabolic health',
      trailing: 'and how your body processes energy, sugar, and fat.',
    },
  ],
};

const ADVANCED_PANEL_COPY = {
  male: {
    whoIsThisFor:
      'Ideal if you have a family history of heart disease, diabetes, or cancer, want to optimize hormones and energy, or simply want to catch what routine checkups miss before symptoms show up.',
    whatsMeasured:
      'Two types of testing in one upgrade. Advanced blood biomarkers screen for cardiovascular risk, hormonal imbalances, and metabolic dysfunction. A complete urinalysis adds visibility into kidney function, hydration, and early signs of systemic disease.',
  },
  female: {
    whoIsThisFor:
      'Ideal if you have a family history of heart disease, thyroid conditions, or diabetes, want clarity on hormonal shifts and cycle health, or simply want to catch what routine checkups miss before symptoms show up.',
    whatsMeasured:
      'Two types of testing in one upgrade. Advanced blood biomarkers screen for cardiovascular risk, reproductive health, hormonal and thyroid imbalances, and metabolic dysfunction. A complete urinalysis adds visibility into kidney function, hydration, and early signs of systemic disease.',
  },
};

const WhyTakeTheTest = ({
  bullets,
}: {
  bullets: {
    icon: ReactNode;
    highlight: string;
    trailing: string;
  }[];
}) => (
  <Detail.Section title="Why take the test?">
    <div className="space-y-3">
      {bullets.map((bullet) => (
        <Detail.BulletPoint icon={bullet.icon} key={bullet.highlight}>
          <span className="text-zinc-900">{bullet.highlight}</span>{' '}
          {bullet.trailing}
        </Detail.BulletPoint>
      ))}
    </div>
  </Detail.Section>
);

const OrderButtons = ({ price }: { price: number }) => {
  const { next } = useOnboardingNavigation();
  const { trackOnboardingCreditPurchase } = useOnboardingAnalytics();
  const { activePaymentMethod, isFlexSelected, isSelectingPaymentMethod } =
    usePaymentMethodSelection();
  const upgradeOrderMutation = useUpgradeCredit();

  const upgradeOrder = async () => {
    const paymentMethodId = activePaymentMethod?.externalPaymentMethodId;
    if (paymentMethodId == null) {
      toast.error('No payment method available');
      return;
    }

    await upgradeOrderMutation.mutateAsync({
      data: {
        upgradeType: 'advanced',
        paymentMethodId,
      },
    });

    trackOnboardingCreditPurchase({
      credits: [{ id: 'advanced-panel', price }],
      totalValue: price,
      paymentProvider: activePaymentMethod?.paymentProvider ?? 'unknown',
    });
    toast.success('One-time Advanced Panel upgrade successful!');
    next();
  };

  const isPending =
    upgradeOrderMutation.isPending || upgradeOrderMutation.isSuccess;

  return (
    <div className="space-y-4">
      <CurrentPaymentMethodCard />
      <Detail.CTAGroup>
        <Button
          variant="vermillion"
          className="w-full"
          onClick={async () => await upgradeOrder()}
          disabled={
            isPending ||
            isSelectingPaymentMethod ||
            activePaymentMethod?.externalPaymentMethodId == null
          }
        >
          {isPending ? (
            <TransactionSpinner />
          ) : (
            <>
              Purchase now{isFlexSelected ? ' with HSA/FSA' : ''}{' '}
              <span className="ml-2 opacity-80">{formatMoney(price)}</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={next}
          disabled={isPending}
        >
          I&apos;m not interested
        </Button>
      </Detail.CTAGroup>
    </div>
  );
};

export const AdvancedPanelUpgradeStep = () => {
  const { data: user } = useUser();
  const { gender } = useGender();
  const { prev } = useOnboardingNavigation();
  const priceInCents = getUpgradePrice(user);
  const copy =
    gender === 'female' ? ADVANCED_PANEL_COPY.female : ADVANCED_PANEL_COPY.male;
  const whyTakeTheTestBullets =
    gender === 'female'
      ? WHY_TAKE_THE_TEST_BULLETS.female
      : WHY_TAKE_THE_TEST_BULLETS.male;
  const biomarkers =
    gender === 'female'
      ? ADVANCED_PANEL_FEMALE_BIOMARKERS
      : ADVANCED_PANEL_MALE_BIOMARKERS;

  const pricing = {
    originalPrice: Math.round(priceInCents * 1.1),
    salePrice: priceInCents,
    discountPercent: 10,
    totalPrice: priceInCents,
  };

  return (
    <>
      <Head title="Advanced Panel Upgrade" />
      <Sequence.StepLayout className="bg-zinc-50 md:bg-white">
        <Sequence.StepHeader className="flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={prev}
            className="flex size-9 items-center justify-center text-zinc-500"
            aria-label="Go back"
          >
            <ChevronLeft className="size-6" />
          </button>
          <span className="text-sm font-medium text-zinc-900">
            Recommended for you
          </span>
          <div className="size-9" />
        </Sequence.StepHeader>

        <div className="flex flex-1 flex-col md:mx-auto md:w-full md:max-w-screen-2xl">
          <button
            type="button"
            onClick={prev}
            className="hidden items-center gap-1 p-8 pb-0 text-zinc-500 md:flex"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex flex-1 flex-col md:flex-row">
            <div className="hidden md:block md:w-1/2 md:p-8">
              <div className="space-y-4">
                <Detail.ProductImage src="/services/advanced-panel-v2.png" />
                <Detail.CuratedByResearchTeam />
                <Detail.TestimonialList testimonials={TESTIMONIALS} />
              </div>
            </div>

            <div className="flex flex-1 flex-col md:w-1/2 md:p-8">
              <Detail.Subheader
                label="50% of members upgrade"
                labelClassName="bg-green-500/10 [&>*]:text-green-500"
                pretext="One-time upgrade"
                className="px-4 md:px-0"
              >
                Upgrade to Advanced Panel, get the full picture
              </Detail.Subheader>

              <div className="hidden space-y-1 px-0 md:block">
                <Detail.Pricing {...pricing} />
                <p className="text-sm text-zinc-500">
                  Everything in the baseline panel, plus 30+ additional blood
                  biomarkers and a complete urinalysis. Go deeper and broader
                  across cardiovascular risk, hormones, metabolic health,
                  inflammation, and kidney function.
                </p>
              </div>

              <div className="hidden space-y-8 py-6 md:block">
                <WhyTakeTheTest bullets={whyTakeTheTestBullets} />
                <OrderButtons price={priceInCents} />
              </div>

              <Detail.Tabs>
                <Detail.TabList />

                <Detail.TabPanel value="overview">
                  <Detail.Content className="space-y-8">
                    <WhyTakeTheTest bullets={whyTakeTheTestBullets} />

                    <Detail.Section title="Who is this for?">
                      <p>{copy.whoIsThisFor}</p>
                    </Detail.Section>

                    <Detail.Section title="What's measured">
                      <p>{copy.whatsMeasured}</p>
                    </Detail.Section>
                  </Detail.Content>
                </Detail.TabPanel>

                <Detail.TabPanel value="biomarkers">
                  <Detail.Content>
                    <Detail.Section title="Biomarkers">
                      <Detail.BiomarkerList biomarkers={biomarkers} />
                    </Detail.Section>
                  </Detail.Content>
                </Detail.TabPanel>
              </Detail.Tabs>

              <div className="hidden flex-1 space-y-8 overflow-y-auto py-8 md:block">
                <Detail.Section title="Who is this for?">
                  <p>{copy.whoIsThisFor}</p>
                </Detail.Section>

                <Detail.Section title="What's measured">
                  <p>{copy.whatsMeasured}</p>
                </Detail.Section>

                <Detail.Section title="Biomarkers">
                  <Detail.BiomarkerList biomarkers={biomarkers} />
                </Detail.Section>
              </div>
            </div>
          </div>
        </div>

        <Detail.Footer className="md:hidden">
          <Detail.ServiceCard
            title="Advanced Panel"
            image="/services/advanced-panel-v2.png"
            {...pricing}
          />
          <OrderButtons price={priceInCents} />
        </Detail.Footer>
      </Sequence.StepLayout>
    </>
  );
};
