import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Body1, Body2, H2, H3, H4 } from '@/components/ui/typography';
import { MALE_HEALTH_PANEL, FEMALE_FERTILITY_PANEL } from '@/const';
import { useAddOnPanelStore } from '@/features/onboarding/stores/add-on-panel-store';
import { useServices } from '@/features/services/api';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useOnboardingStepper } from './onboarding-stepper';

const HormonePanelContent = () => {
  const { next } = useOnboardingStepper();
  const { togglePanel } = useAddOnPanelStore();
  const { data: user } = useUser();

  // Get the add-on services for the user
  const { data, isLoading: isServicesLoading } = useServices({
    group: 'blood-panel-addon',
  });

  const isMale = user?.gender?.toLowerCase() === 'male';
  const panelName = isMale ? MALE_HEALTH_PANEL : FEMALE_FERTILITY_PANEL;

  const handleAddPanel = () => {
    const hormonePanel = data?.services.find((s) => s.name === panelName);

    if (hormonePanel) {
      togglePanel(hormonePanel.id);
    }

    next();
  };

  const handleSkip = () => {
    next();
  };

  if (isServicesLoading) {
    return null;
  }

  const hormonePanel = data?.services.find((s) => s.name === panelName);

  if (!hormonePanel) {
    handleSkip();
    return null;
  }

  return (
    <>
      <div className="hidden w-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-10 lg:sticky lg:top-8 lg:flex lg:self-start">
        <Body1 className="text-zinc-500">One-time upgrade</Body1>
        <ProductInfo />
        <ServiceInfoCard className="block md:hidden" />
      </div>
      <div className="w-full space-y-6 p-4 md:p-10">
        <div className="flex justify-start md:justify-end">
          <SuperpowerLogo />
        </div>
        <div className="space-y-2">
          <H2>
            {isMale
              ? 'Decode your testosterone'
              : 'Understand your fertility window'}
          </H2>
          <Body1 className="text-zinc-500">
            {isMale
              ? 'Go beyond a single number. Measure production, regulation, and binding to see the full picture.'
              : 'A complete look at the hormones and biomarkers behind ovulation, ovarian reserve, and your overall fertility picture.'}
          </Body1>

          <ProductInfo className="lg:hidden" />
        </div>
        <div className="space-y-2">
          <H3 className="m-0 text-zinc-900">
            {isMale ? 'The complete hormone picture' : 'Why this is for you'}
          </H3>
          <Body1 className="text-zinc-500">
            {isMale
              ? 'We measure total testosterone, SHBG and albumin to calculate free T, plus LH and FSH (production vs. signaling), estradiol E2, and prolactin. Context markers include CBC/hematocrit, liver enzymes, lipid profile, HbA1c, and vitamin D.'
              : 'We measure AMH (ovarian reserve), FSH and LH (day-3), estradiol E2 (day-3), progesterone (luteal phase), prolactin, TSH and Free T4, plus SHBG, free testosterone, and vitamin D for context.'}
          </Body1>
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">
            {isMale ? 'Actionable, time-of-day aware' : 'Why it matters'}
          </H4>
          <Body1 className="text-zinc-500">
            {isMale
              ? 'Morning draw guidance, age-adjusted ranges, and clear steps to improve levels—covering training, sleep, weight, alcohol, and medications.'
              : 'Get age- and cycle-day-adjusted ranges with plain-English explanations. See signals of anovulation, luteal phase insufficiency, or thyroid-related issues that can affect conception.'}
          </Body1>
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">
            {isMale
              ? "Find what's holding you back"
              : 'From results to next steps'}
          </H4>
          <Body1 className="text-zinc-500">
            {isMale
              ? 'See if low T is driven by pituitary signaling, testicular production, or high SHBG. Track changes with follow-up testing and targeted lifestyle changes.'
              : 'Receive timing reminders, actionable lifestyle guidance, and when to retest. Share a downloadable report with your clinician to discuss treatment or fertility planning.'}
          </Body1>
        </div>

        <ServiceInfoCard className="block md:hidden" />

        <div className="flex flex-col gap-2">
          <Button onClick={handleAddPanel}>
            Add {isMale ? "Men's Health Panel" : 'Female Fertility Panel'} -{' '}
            {formatMoney(hormonePanel.price)}
          </Button>
          <Button variant="outline" className="bg-white" onClick={handleSkip}>
            Skip for now
          </Button>
          <div className="flex gap-6 pt-4 text-xs text-zinc-400">
            <a
              href="https://www.superpower.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-150 hover:text-zinc-500"
            >
              Privacy Policy
            </a>
            <a
              href="https://www.superpower.com/terms"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-150 hover:text-zinc-500"
            >
              Terms of services
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

const ProductInfo = ({ className }: { className?: string }) => {
  const { data: user } = useUser();

  const isMale = user?.gender?.toLowerCase() === 'male';

  // Determine splash image based on gender
  const splashImage = isMale
    ? '/onboarding/splash/hormones-splash-male.webp'
    : '/onboarding/splash/hormones-splash-female.webp';

  return (
    <div className={cn('space-y-2 lg:space-y-4', className)}>
      <div className="relative">
        <img
          src={splashImage}
          alt="hormone-panel"
          className="pointer-events-none mx-auto w-full rounded-[20px] object-contain"
        />
        <div className="absolute bottom-6 left-6">
          <H4 className="text-white">
            {isMale
              ? 'Understand what influences your testosterone.'
              : 'Understand your fertility & cycle health with a'}
          </H4>
          <H4 className="text-white">
            {isMale
              ? 'To boost strength, libido, mood and drive.'
              : 'complete view of your hormones and metabolism.'}
          </H4>
        </div>
      </div>
      <ServiceInfoCard className="hidden md:block" />
    </div>
  );
};

const ServiceInfoCard = ({ className }: { className?: string }) => {
  const { data: user } = useUser();
  const { data } = useServices({
    group: 'blood-panel-addon',
  });

  const isMale = user?.gender?.toLowerCase() === 'male';
  const panelName = isMale ? MALE_HEALTH_PANEL : FEMALE_FERTILITY_PANEL;
  const hormonePanel = data?.services.find((s) => s.name === panelName);

  const tubeImage = isMale
    ? '/onboarding/tubes/testosterone-tube.png'
    : '/onboarding/tubes/fertility-tube.png';

  return (
    <div className={cn('space-y-2', className)}>
      {hormonePanel && (
        <div className="rounded-[20px] border border-zinc-200 bg-white p-5">
          <div className="flex flex-row items-center justify-between gap-4">
            <img
              src={tubeImage}
              alt="hormone-panel"
              className="pointer-events-none size-16 object-contain"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <Body1>{hormonePanel.name}</Body1>
              <Body2 className="text-zinc-500">Diagnostic Test</Body2>
            </div>
            <Body1>{formatMoney(hormonePanel.price)}</Body1>
          </div>
        </div>
      )}
    </div>
  );
};

export const HormonePanelStep = () => (
  <SplitScreenLayout title="Hormone Testing" className="bg-zinc-50">
    <HormonePanelContent />
  </SplitScreenLayout>
);
