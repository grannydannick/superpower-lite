import { useMemo } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { SplitScreenLayout } from '@/components/layouts/split-screen-layout';
import { Body1, H2 } from '@/components/ui/typography';
import { ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL } from '@/const';
import { useUpgradeOrder } from '@/features/orders/api/upgrade-order';
import { AddOnPanelsSelect } from '@/features/orders/components/steps';
import { useHasCredit } from '@/features/orders/hooks';
import * as Payment from '@/features/users/components/payment';

import { useAddOnPanels } from '../../hooks/use-add-on-panels';
import { useOnboardingStepper } from '../onboarding-steps/onboarding-stepper';

const AddOnPanelsContent = () => {
  const { next } = useOnboardingStepper();
  const { selectedIds, setSelectedIds } = useAddOnPanels();

  const { credit } = useHasCredit({
    serviceName: SUPERPOWER_BLOOD_PANEL,
  });

  const existingCreditIds = useMemo(
    () => (credit ? new Set([credit.serviceId]) : undefined),
    [credit],
  );

  const upgradeOrderMutation = useUpgradeOrder();

  const upgradeOrder = async (paymentMethodId: string) => {
    await upgradeOrderMutation.mutateAsync({
      data: {
        upgradeType: 'custom-panel',
        addOnServiceIds: [...selectedIds],
        paymentMethodId,
      },
    });
    next();
  };

  return (
    <>
      <div className="hidden w-full flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-10 lg:sticky lg:top-8 lg:flex lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] lg:overflow-auto">
        <Body1 className="text-zinc-500">Add-on lab tests</Body1>
        <AddOnPanelsSelect
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          existingCreditIds={existingCreditIds}
          isLoading={upgradeOrderMutation.isPending}
          className="max-h-fit flex-1 overflow-y-scroll"
          excludeServices={[SUPERPOWER_BLOOD_PANEL]}
        />
      </div>
      <div className="w-full space-y-8 p-4 md:p-10">
        <div className="flex justify-start md:justify-end">
          <SuperpowerLogo />
        </div>
        <div className="space-y-2">
          <H2>Build your health foundation</H2>
          <Body1 className="text-zinc-500">
            Your Baseline test includes 100+ biomarkers across key areas of
            health. Add specialty tests to uncover deeper, evidence-based
            insights tailored to your personal goals.
          </Body1>
        </div>
        <div className="lg:hidden">
          <Body1 className="text-zinc-500">Add-on lab tests</Body1>
          <AddOnPanelsSelect
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            existingCreditIds={existingCreditIds}
            isLoading={upgradeOrderMutation.isPending}
            className="max-h-fit flex-1 overflow-y-scroll"
            excludeServices={[ADVANCED_BLOOD_PANEL, SUPERPOWER_BLOOD_PANEL]}
          />
        </div>
        <Payment.PaymentGroup>
          <Payment.PaymentDetails />
          <Payment.CurrentPaymentMethodCard className="!bg-white" />
          <Payment.SubmitPayment
            onSubmit={upgradeOrder}
            onCancel={next}
            submitLabel="Purchase"
            isPending={upgradeOrderMutation.isPending}
            isSuccess={upgradeOrderMutation.isSuccess}
            enabled={selectedIds.size > 0}
          />
        </Payment.PaymentGroup>
      </div>
    </>
  );
};

export const AddOnPanelsStep = () => (
  <SplitScreenLayout title="Add-on lab tests" className="bg-zinc-50">
    <AddOnPanelsContent />
  </SplitScreenLayout>
);
