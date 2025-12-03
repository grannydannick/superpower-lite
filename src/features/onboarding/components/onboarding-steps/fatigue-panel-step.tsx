import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Body1, Body2, H2, H3, H4 } from '@/components/ui/typography';
import { FATIGUE_PANEL } from '@/const';
import { useAddOnPanelStore } from '@/features/onboarding/stores/add-on-panel-store';
import { useServices } from '@/features/services/api';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useOnboardingStepper } from './onboarding-stepper';

const FatiguePanelContent = () => {
  const { next } = useOnboardingStepper();
  const { togglePanel } = useAddOnPanelStore();

  // Get the add-on services for the user
  const { data, isLoading: isServicesLoading } = useServices({
    group: 'blood-panel-addon',
  });

  const handleAddPanel = () => {
    const fatiguePanel = data?.services.find((s) => s.name === FATIGUE_PANEL);

    if (fatiguePanel) {
      togglePanel(fatiguePanel.id);
    }

    next();
  };

  const handleSkip = () => {
    next();
  };

  if (isServicesLoading) {
    return null;
  }

  const fatiguePanel = data?.services.find((s) => s.name === FATIGUE_PANEL);

  if (!fatiguePanel) {
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
          <H2>Stop feeling tired all the time</H2>
          <Body1 className="text-zinc-500">
            Fatigue isn&apos;t &quot;just being tired.&quot; This panel checks
            the most common biological drivers so you can finally understand why
            your energy is low.
          </Body1>

          <ProductInfo className="lg:hidden" />
        </div>
        <div className="space-y-2">
          <H3 className="m-0 text-zinc-900">Fatigue: decoded</H3>
          <Body1 className="text-zinc-500">
            Get a complete look at the major systems that influence daily
            energy: hormone shifts, nutrient gaps, inflammation, immune activity
            and blood sugar patterns.
          </Body1>
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">Built for action, not guesswork</H4>
          <Body1 className="text-zinc-500">
            We measure stress hormones (cortisol, ACTH), thyroid markers, iron
            and ferritin, insulin, DHEA-S, inflammation markers, immune
            antibodies, RBC magnesium, and full blood counts to show exactly
            what may be draining your energy.
          </Body1>
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">
            See what&apos;s draining your tank
          </H4>
          <Body1 className="text-zinc-500">
            Know whether fatigue stems from low iron, thyroid imbalance,
            nutrient gaps, inflammation, or blood sugar swings. Track
            improvements over time with simple re-tests.
          </Body1>
        </div>

        <ServiceInfoCard className="block md:hidden" />

        <div className="flex flex-col gap-2">
          <Button onClick={handleAddPanel}>
            Add Fatigue Panel - {formatMoney(fatiguePanel.price)}
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
  return (
    <div className={cn('space-y-2 lg:space-y-4', className)}>
      <div className="relative">
        <img
          src="/onboarding/splash/fatigue-splash.webp"
          alt="fatigue-panels"
          className="pointer-events-none mx-auto w-full rounded-[20px] object-contain"
        />
        <div className="absolute bottom-6 left-6">
          <H4 className="text-white">
            Find the real reason you&apos;re always tired.
          </H4>
          <H4 className="text-white">So you can get your energy back.</H4>
        </div>
      </div>
      <ServiceInfoCard className="hidden md:block" />
    </div>
  );
};

const ServiceInfoCard = ({ className }: { className?: string }) => {
  const { data } = useServices({
    group: 'blood-panel-addon',
  });

  const fatiguePanel = data?.services.find((s) => s.name === FATIGUE_PANEL);

  return (
    <div className={cn('space-y-2', className)}>
      {fatiguePanel && (
        <div className="rounded-[20px] border border-zinc-200 bg-white p-5">
          <div className="flex flex-row items-center justify-between gap-4">
            <img
              src="/services/fatigue.png"
              alt="fatigue-panel"
              className="pointer-events-none size-16 object-contain"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <Body1>{fatiguePanel.name}</Body1>
              <Body2 className="text-zinc-500">Diagnostic Test</Body2>
            </div>
            <Body1>{formatMoney(fatiguePanel.price)}</Body1>
          </div>
        </div>
      )}
    </div>
  );
};

export const FatiguePanelStep = () => (
  <SplitScreenLayout title="Fatigue Testing" className="bg-zinc-50">
    <FatiguePanelContent />
  </SplitScreenLayout>
);
