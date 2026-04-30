import type { RefObject } from 'react';

import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import type { AdvancedUpgradeBundleId } from '@/const';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import type { User } from '@/types/api';
import { formatMoney } from '@/utils/format-money';

import { BundleMobileCompactSelector } from './bundle-picker-options';
import type { BundleGenderCopyInput } from './bundle-picker-products';
import {
  type BundlePickerPurchaseInteraction,
  bundlePickerCtaDisabled,
} from './bundle-picker-purchase-interaction';

interface BundlePickerMobileFooterProps {
  selectedPrice: number;
  interaction: BundlePickerPurchaseInteraction;
  user: User | undefined;
  bundleOrder: AdvancedUpgradeBundleId[];
  selectedId: AdvancedUpgradeBundleId;
  gender: BundleGenderCopyInput['gender'];
  onSelect: (id: AdvancedUpgradeBundleId, price: number) => void;
  selectorRef: RefObject<HTMLDivElement | null>;
  bundleSelectorDisabled: boolean;
}

export function BundlePickerMobileFooter({
  selectedPrice,
  interaction,
  user,
  bundleOrder,
  selectedId,
  gender,
  onSelect,
  selectorRef,
  bundleSelectorDisabled,
}: BundlePickerMobileFooterProps) {
  const {
    isPending,
    isConfirmingPurchase,
    isFlexSelected,
    onCancelConfirm,
    onSkip,
    onUpgradeCta,
  } = interaction;
  const ctaDisabled = bundlePickerCtaDisabled(interaction);

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 overflow-visible md:hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[calc(100%+24px)] bg-[linear-gradient(to_bottom,transparent_0,rgba(250,250,250,0.45)_16px,rgba(250,250,250,0.92)_34px,#fafafa_40px)] backdrop-blur-md [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,rgba(0,0,0,0.35)_25px,rgba(0,0,0,0.88)_50px,rgb(0_0_0)_80px)] [mask-image:linear-gradient(to_bottom,transparent_0,rgba(0,0,0,0.35)_25px,rgba(0,0,0,0.88)_50px,rgb(0_0_0)_80px)]"
      />
      <div className="relative z-10 flex flex-col gap-4 px-4 pb-4 pt-6">
        {isConfirmingPurchase ? null : (
          <BundleMobileCompactSelector
            user={user}
            bundleOrder={bundleOrder}
            selectedId={selectedId}
            disabled={bundleSelectorDisabled}
            gender={gender}
            onSelect={onSelect}
            selectorRef={selectorRef}
          />
        )}
        <p className="text-center text-xs text-zinc-900/50">
          One time payment, non-recurring
        </p>
        {isConfirmingPurchase && (
          <div className="duration-500 ease-out animate-in fade-in slide-in-from-bottom-3">
            <CurrentPaymentMethodCard className="rounded-xl px-3 py-3" />
          </div>
        )}
        <Button
          data-testid="bundle-mobile-upgrade-cta"
          className="w-full"
          onClick={onUpgradeCta}
          disabled={ctaDisabled}
        >
          {isPending ? (
            <TransactionSpinner />
          ) : isConfirmingPurchase ? (
            <>
              Confirm
              {isFlexSelected === true ? ' with HSA/FSA' : ''}
            </>
          ) : (
            <>
              Upgrade
              {isFlexSelected === true ? ' with HSA/FSA' : ''} —{' '}
              {formatMoney(selectedPrice)}
            </>
          )}
        </Button>
        <Button
          data-testid="bundle-mobile-skip-cta"
          type="button"
          variant="outline"
          onClick={isConfirmingPurchase ? onCancelConfirm : onSkip}
          disabled={isPending}
          className="w-full bg-white"
        >
          {isConfirmingPurchase ? 'Cancel' : 'No thank you'}
        </Button>
      </div>
    </div>
  );
}
