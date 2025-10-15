import { CircleCheckBig } from 'lucide-react';
import { useState } from 'react';

import { SuperpowerLogo } from '@/components/icons/superpower-logo';
import { PaymentDetails } from '@/components/shared/payment-details';
import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { Body1, H2 } from '@/components/ui/typography';
import { SUPERPOWER_BLOOD_PANEL } from '@/const';
import { useUpgradeOrder } from '@/features/orders/api/upgrade-order';
import { AddOnPanelsSelect } from '@/features/orders/components/steps';
import { useHasCredit } from '@/features/orders/hooks';
import { usePaymentMethodSelection } from '@/features/settings/hooks';
import { CurrentPaymentMethodCard } from '@/features/users/components/current-payment-method-card';

export const UpsellAddOn = ({ goToNext }: { goToNext: () => void }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | undefined
  >();
  const [isSelectingPaymentMethod, setIsSelectingPaymentMethod] =
    useState(false);

  const { credit } = useHasCredit({
    serviceName: SUPERPOWER_BLOOD_PANEL,
  });

  const upgradeOrderMutation = useUpgradeOrder();

  const { isFlexSelected, hasFlexPaymentMethod, activePaymentMethod } =
    usePaymentMethodSelection(selectedPaymentMethodId);

  const handlePaymentMethodSelect = (id: string) => {
    setSelectedPaymentMethodId(id);
    setIsSelectingPaymentMethod(false);
  };

  const upgradeOrder = async () => {
    await upgradeOrderMutation.mutateAsync({
      data: {
        upgradeType: 'custom-panel',
        addOnServiceIds: [...selectedIds],
        paymentMethodId: activePaymentMethod?.externalPaymentMethodId,
      },
    });
    goToNext();
  };

  return (
    <>
      <div className="w-full flex-col gap-6 rounded-3xl p-4 lg:sticky lg:top-8 lg:flex lg:h-[calc(100svh-4rem)] lg:max-h-[calc(100svh-4rem)] lg:overflow-auto lg:border lg:border-zinc-200 lg:bg-white lg:p-10">
        <Body1 className="text-zinc-500">Add-on lab tests</Body1>
        <AddOnPanelsSelect
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          existingCreditIds={credit ? new Set([credit.serviceId]) : undefined}
          isLoading={upgradeOrderMutation.isPending}
          className="max-h-fit flex-1 overflow-y-scroll"
        />
      </div>
      <div className="w-full space-y-8 px-4 md:px-8">
        <SuperpowerLogo />
        <div className="space-y-2">
          <H2>Build your health foundation</H2>
          <Body1 className="text-zinc-500">
            Your Baseline test includes 100+ biomarkers across key areas of
            health. Add specialty tests to uncover deeper, evidence-based
            insights tailored to your personal goals.
          </Body1>
        </div>
        <div className="space-y-4">
          <PaymentDetails />
          <CurrentPaymentMethodCard
            selectedPaymentMethodId={selectedPaymentMethodId}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            isEditing={isSelectingPaymentMethod}
            setIsEditing={setIsSelectingPaymentMethod}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            disabled={upgradeOrderMutation.isPending || selectedIds.size === 0}
            onClick={upgradeOrder}
          >
            {upgradeOrderMutation.isPending ? (
              <TransactionSpinner className="flex justify-center" />
            ) : (
              <>
                {isFlexSelected && (
                  <CircleCheckBig className="mr-2 size-[20px]" />
                )}
                Purchase{isFlexSelected ? ' with HSA/FSA' : ''}
              </>
            )}
          </Button>
          {hasFlexPaymentMethod && !selectedPaymentMethodId && (
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => setIsSelectingPaymentMethod(true)}
            >
              <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
              Select HSA/FSA card
            </Button>
          )}
          <Button
            variant={selectedPaymentMethodId ? 'outline' : 'white'}
            className="bg-white"
            disabled={upgradeOrderMutation.isPending}
            onClick={goToNext}
          >
            No thanks
          </Button>
        </div>
        <div className="flex gap-6 text-xs text-zinc-400">
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
    </>
  );
};
