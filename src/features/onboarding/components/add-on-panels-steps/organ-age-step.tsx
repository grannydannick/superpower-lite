// import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
// import { AvailableBiomarkersDialog } from '@/components/shared/available-biomarkers';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Body1, Body2, H2, H4 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL } from '@/const/services';
import { useUpgradeOrder } from '@/features/orders/api/upgrade-order';
import { useHasCredit } from '@/features/orders/hooks';
import { useServices } from '@/features/services/api';
import * as Payment from '@/features/users/components/payment';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useAddOnPanels } from '../../hooks/use-add-on-panels';
import { useOnboardingStepper } from '../onboarding-steps/onboarding-stepper';

import { AddOnPanelsStepper } from './add-on-panels-stepper';

const ORGAN_AGE_PRICE = 9900;

const OrganAgeContent = () => {
  const { next: nextAddOnPanelsStep } = AddOnPanelsStepper.useStepper();
  const { next: nextOnboardingStep } = useOnboardingStepper();

  const { togglePanel } = useAddOnPanels();

  const upgradeOrderMutation = useUpgradeOrder();

  // Check if the user has advanced credit
  const {
    hasCredit: hasAdvancedCredit,
    isCreditLoading: isAdvancedCreditLoading,
  } = useHasCredit({
    serviceName: ADVANCED_BLOOD_PANEL,
  });

  // Get the add-on services for the user
  const { data: addOnServicesData, isLoading: isServicesLoading } = useServices(
    {
      group: 'blood-panel-addon',
    },
  );

  // Find the organ-age service
  const organAgeService = useMemo(() => {
    const addOnServices = addOnServicesData?.services ?? [];
    return addOnServices.find((service) =>
      service.id.startsWith('v2-organ-age'),
    );
  }, [addOnServicesData?.services]);

  // If the user has advanced credit, upgrade the order and skip the add-on panels step
  const upgradeOrder = async (paymentMethodId: string) => {
    if (!organAgeService?.id) {
      return;
    }
    await upgradeOrderMutation.mutateAsync({
      data: {
        upgradeType: 'custom-panel',
        addOnServiceIds: [organAgeService.id],
        paymentMethodId,
      },
    });
    toast.success(`One-time Organ Age upgrade successful!`);
    setTimeout(() => {
      nextOnboardingStep();
    }, 3000);
  };

  // If the user doesn't have advanced credit, add the organ age service to the selected IDs and advance to the add-on panels step
  const addOrganAge = () => {
    if (!organAgeService?.id) {
      return;
    }
    togglePanel(organAgeService.id);
    nextAddOnPanelsStep();
  };

  // Show loading state while checking credit
  if (isAdvancedCreditLoading || isServicesLoading) {
    return null;
  }

  return (
    <>
      <div className="hidden w-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-10 lg:sticky lg:top-8 lg:flex lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] lg:overflow-auto">
        <Body1 className="text-zinc-500">One-time upgrade</Body1>
        <ProductInfo />
        <TotalInfo className="block md:hidden" />
      </div>
      <div className="w-full space-y-8 p-4 md:p-10">
        <div className="flex justify-start md:justify-end">
          <SuperpowerLogo />
        </div>
        <div className="space-y-2">
          <H2>Go beyond your Biological Age</H2>
          <Body1 className="text-zinc-500">
            Understand how each of your body&apos;s major systems is aging, from
            heart & metabolism to brain & immune health.
          </Body1>

          <ProductInfo className="lg:hidden" />
          {/* TODO: Add available biomarkers dialog */}
          {/* <AvailableBiomarkersDialog>
            <Button
              variant="ghost"
              className="gap-1 px-0 py-2 text-sm text-zinc-500"
            >
              View all 9 measured systems
              <ArrowRight size={16} />
            </Button>
          </AvailableBiomarkersDialog> */}
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">
            The most detailed BioAge test available
          </H4>
          <Body1 className="text-zinc-500">
            Go beyond a single &quot;biological age&quot; number. OrganAge
            calculates system-specific biological ages across 9 key areas of
            health. See which systems are aging faster and where to focus your
            efforts for prevention & longevity.
          </Body1>
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">World leading science</H4>
          <Body1 className="text-zinc-500">
            Built with Cosmica Bio. OrganAge builds on one of the largest human
            aging datasets ever analyzed.
          </Body1>
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">
            See what&apos;s driving your results
          </H4>
          <Body1 className="text-zinc-500">
            Pinpoint what&apos;s accelerating or protecting your health with a
            breakdown of top contributing biomarkers.
          </Body1>
        </div>
        <div className="flex items-center gap-2">
          <Body2 className="text-zinc-500">Built with</Body2>
          <img
            src="/affiliate/cosmica-logo.webp"
            alt="organ-age"
            className="pointer-events-none h-[1em] object-contain"
          />
        </div>
        <TotalInfo className="block md:hidden" />
        {((hasAdvancedCredit || upgradeOrderMutation.isSuccess) && (
          <Payment.PaymentGroup>
            <Payment.PaymentDetails />
            <Payment.CurrentPaymentMethodCard className="!bg-white" />
            <Payment.SubmitPayment
              onSubmit={upgradeOrder}
              onCancel={nextOnboardingStep}
              submitLabel="Add Organ Age"
              isPending={upgradeOrderMutation.isPending}
              isSuccess={upgradeOrderMutation.isSuccess}
              enabled
            />
          </Payment.PaymentGroup>
        )) || (
          <div className="flex flex-col gap-2">
            <Button onClick={addOrganAge}>Add Organ Age</Button>
            <Button
              variant="outline"
              className="bg-white"
              onClick={nextAddOnPanelsStep}
            >
              No thanks
            </Button>
            <div className="mt-8 flex gap-6 text-xs text-zinc-400">
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
        )}
      </div>
    </>
  );
};

const ProductInfo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-2 lg:space-y-4', className)}>
      <img
        src="/onboarding/upsell/organ-age-card.webp"
        alt="organ-age"
        className="pointer-events-none mx-auto w-full object-contain pt-4"
      />
      <div className="hidden lg:block">
        <H4>OrganAge</H4>
        <Body2 className="mt-2 text-zinc-500">
          Uncover your biological age across 9 key systems to target what&apos;s
          really driving your health.
        </Body2>
      </div>
      <TotalInfo className="hidden md:block" />
      <div className="flex flex-col items-center justify-center gap-2 lg:hidden">
        <Body1 className="text-zinc-500">One time Upgrade</Body1>
        <div className="w-full space-y-2">
          <Body1 className="text-zinc-500">
            Uncover your biological age across 9 key systems to target
            what&apos;s really driving your health.
          </Body1>
        </div>
      </div>
    </div>
  );
};

const TotalInfo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Body1 className="text-zinc-500">Subtotal</Body1>
        <Body1>+{formatMoney(ORGAN_AGE_PRICE)}</Body1>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <Body1 className="text-zinc-500">Total</Body1>
        <Body1>+{formatMoney(ORGAN_AGE_PRICE)}</Body1>
      </div>
    </div>
  );
};

export const OrganAgeStep = () => (
  <SplitScreenLayout title="Upgrade" className="bg-zinc-50">
    <OrganAgeContent />
  </SplitScreenLayout>
);
