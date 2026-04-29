import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import { formatMoney } from '@/utils/format-money';

import {
  type BundlePickerPurchaseInteraction,
  bundlePickerCtaDisabled,
} from './bundle-picker-purchase-interaction';

interface BundlePickerMobileFooterProps {
  selectedPrice: number;
  interaction: BundlePickerPurchaseInteraction;
}

export function BundlePickerMobileFooter({
  selectedPrice,
  interaction,
}: BundlePickerMobileFooterProps) {
  const {
    isPending,
    isConfirmingPurchase,
    isFlexSelected,
    onSkip,
    onUpgradeCta,
  } = interaction;
  const ctaDisabled = bundlePickerCtaDisabled(interaction);

  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 flex flex-col gap-2 border-t border-zinc-900/5 bg-zinc-50 px-4 py-4 md:hidden">
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
        onClick={onSkip}
        disabled={isPending}
        className="w-full bg-white"
      >
        No thank you
      </Button>
    </div>
  );
}
