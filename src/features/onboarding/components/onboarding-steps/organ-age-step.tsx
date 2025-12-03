import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts';
import { toast } from '@/components/ui/sonner';
import { Body1, Body2, H2, H3, H4 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL, ORGAN_AGE_PANEL } from '@/const';
import { useAddOnPanelStore } from '@/features/onboarding/stores/add-on-panel-store';
import { useUpgradeOrder } from '@/features/orders/api/upgrade-order';
import { useHasCredit } from '@/features/orders/hooks';
import { useServices } from '@/features/services/api';
import * as Payment from '@/features/users/components/payment';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';

import { useOnboardingStepper } from './onboarding-stepper';

const ORGAN_AGE_PRICE = 9900;

const OrganAgeContent = () => {
  const { next, methods } = useOnboardingStepper();
  const { togglePanel } = useAddOnPanelStore();

  const { credit } = useHasCredit({
    serviceName: ADVANCED_BLOOD_PANEL,
  });

  const upgradeOrderMutation = useUpgradeOrder({
    mutationConfig: {
      onSuccess: () => {
        toast.success(`One-time OrganAge upgrade successful!`);
      },
    },
  });

  // Get the add-on services for the user
  const { data, isLoading: isServicesLoading } = useServices({
    group: 'blood-panel-addon',
  });

  const goToNext = () => {
    if (credit) {
      methods.goTo('test-kit-steps');
    } else {
      next();
    }
  };

  // If the user has advanced credit, upgrade the order and skip the add-on panels step
  const upgradeOrder = async (paymentMethodId: string) => {
    const organAge = data?.services.find((s) => s.name === ORGAN_AGE_PANEL);

    if (!organAge) {
      toast.error('Something went wrong, contact concierge@superpower.com');
      return;
    }

    if (credit) {
      await upgradeOrderMutation.mutateAsync({
        data: {
          upgradeType: 'custom-panel',
          addOnServiceIds: [organAge.id],
          paymentMethodId,
        },
      });
    } else {
      togglePanel(organAge.id);
    }

    goToNext();
  };

  if (isServicesLoading) {
    return null;
  }

  const organAgePanel = data?.services.find((s) => s.name === ORGAN_AGE_PANEL);

  if (!organAgePanel) {
    goToNext();
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
          <H2>Calculate your OrganAge</H2>
          <Body1 className="text-zinc-500">
            Understand how each of your body&apos;s major systems is aging, from
            heart and metabolism to brain and immune health.
          </Body1>

          <ProductInfo className="lg:hidden" />
        </div>
        <div className="space-y-2">
          <H3 className="m-0 text-zinc-900">Precision aging insights</H3>
          <Body1 className="text-zinc-500">
            OrganAge measures how old your body functions, not just how many
            years you&apos;ve lived. It analyzes biomarkers across key systems
            like metabolism, inflammation, liver, and kidney health to create a
            precise map of your biological aging.
          </Body1>
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">
            Developed from world leading science
          </H4>
          <Body1 className="text-zinc-500">
            Powered by Cosmica Bio, OrganAge is trained on hundreds of thousands
            of data sets to link your biomarker profile with real-world outcomes
            like longevity and disease risk.
          </Body1>
        </div>
        <div className="space-y-2">
          <H4 className="m-0 text-zinc-900">
            See what&apos;s driving your results
          </H4>
          <Body1 className="text-zinc-500">
            Unlike generic BioAge tests, OrganAge reveals how each system in
            your body is aging and which biomarkers are contributing most.
            You&apos;ll see where you&apos;re aging faster or slower than
            expected, and what&apos;s driving it, from inflammation to metabolic
            stress.
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
        <ServiceInfoCard className="block md:hidden" />

        <Payment.PaymentGroup>
          {credit && (
            <>
              <Payment.PaymentDetails />
              <Payment.CurrentPaymentMethodCard className="!bg-white" />
            </>
          )}
          <Payment.SubmitPayment
            onSubmit={upgradeOrder}
            onCancel={goToNext}
            submitLabel={`Add Organ Age Panel - ${formatMoney(organAgePanel.price)}`}
            isPending={upgradeOrderMutation.isPending}
            isSuccess={upgradeOrderMutation.isSuccess}
            enabled
          />
        </Payment.PaymentGroup>
      </div>
    </>
  );
};

const ProductInfo = ({ className }: { className?: string }) => {
  const { data: user } = useUser();

  // Determine splash image based on gender
  const splashImage =
    user?.gender?.toLowerCase() === 'female'
      ? '/onboarding/splash/organ-age-splash-female.webp'
      : '/onboarding/splash/organ-age-splash-male.webp';

  return (
    <div className={cn('space-y-2 lg:space-y-4', className)}>
      <div className="relative">
        <img
          src={splashImage}
          alt="organ-age"
          className="pointer-events-none mx-auto w-full rounded-[20px] object-contain"
        />
        <div className="absolute bottom-6 left-6">
          <H4 className="text-white">
            Uncover your biological age across 9 key organs
          </H4>
          <H4 className="text-white">to understand how your body is aging.</H4>
        </div>
      </div>
      <ServiceInfoCard className="hidden md:block" />
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

const ServiceInfoCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'bg-white p-5 rounded-[20px] border border-zinc-200',
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between gap-4">
        <img
          src="/onboarding/tubes/organ-age-tube.png"
          alt="organ-age"
          className="pointer-events-none size-16 object-contain"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Body1>Organ Age Panel</Body1>
          <Body2 className="text-zinc-500">Diagnostic Test</Body2>
        </div>
        <Body1>{formatMoney(ORGAN_AGE_PRICE)}</Body1>
      </div>
    </div>
  );
};

export const OrganAgeStep = () => (
  <SplitScreenLayout title="Upgrade" className="bg-zinc-50">
    <OrganAgeContent />
  </SplitScreenLayout>
);
