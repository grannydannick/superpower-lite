import { ChevronRight } from 'lucide-react';

import { useStepper } from '@/components/ui/stepper';
import { Body1, H1 } from '@/components/ui/typography';
import { EntryLayout } from '@/features/onboarding/components/layouts';
import { VitalLinkButton } from '@/features/settings/components/vital-button';

export const WearablesEntry = () => {
  const { nextOnboardingStep } = useStepper((s) => s);

  return (
    <section
      id="main"
      className="mx-auto flex max-w-[568px] flex-col gap-y-6 text-center"
    >
      <div className="space-y-2">
        <H1 className="text-white">Connect your wearable devices</H1>
        <Body1 className="text-white">
          + hundreds of additional data integrations
        </Body1>
      </div>
      <VitalLinkButton
        className="mx-auto flex flex-row items-center justify-center gap-1 rounded-[50px] bg-white p-4 text-zinc-900 hover:bg-white/90"
        callback={nextOnboardingStep}
      >
        Connect
        <ChevronRight className="size-4" />
      </VitalLinkButton>
      <Body1
        className="cursor-pointer text-white hover:text-white/90"
        onClick={nextOnboardingStep}
      >
        Skip and connect later
      </Body1>
    </section>
  );
};

export const WearablesEntryStep = () => (
  <EntryLayout title="Wearables" type="empty" className="bg-watch">
    <WearablesEntry />
  </EntryLayout>
);
