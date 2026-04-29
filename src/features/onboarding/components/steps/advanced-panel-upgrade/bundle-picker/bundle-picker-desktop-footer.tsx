import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
import { CurrentPaymentMethodCard } from '@/features/users/components/payment';
import { formatMoney } from '@/utils/format-money';

import { ADVANCED_PANEL_IMAGE } from './bundle-picker-assets';
import {
  type BundlePickerPurchaseInteraction,
  bundlePickerCtaDisabled,
} from './bundle-picker-purchase-interaction';

interface BundlePickerDesktopFooterProps {
  footerLabel: string;
  selectedPrice: number;
  interaction: BundlePickerPurchaseInteraction;
}

export function BundlePickerDesktopFooter({
  footerLabel,
  selectedPrice,
  interaction,
}: BundlePickerDesktopFooterProps) {
  const {
    isPending,
    isConfirmingPurchase,
    isFlexSelected,
    onSkip,
    onUpgradeCta,
  } = interaction;
  const ctaDisabled = bundlePickerCtaDisabled(interaction);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-zinc-900/10 bg-white/95 px-8 py-4 shadow-lg backdrop-blur md:flex md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative size-12 overflow-hidden">
          <img
            alt=""
            src={ADVANCED_PANEL_IMAGE}
            className="size-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900">{footerLabel}</p>
          <p className="text-sm text-zinc-500">
            {formatMoney(selectedPrice)} · one-time add-on
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onSkip}
          disabled={isPending}
          className="text-sm font-medium text-zinc-500 underline-offset-4 hover:underline disabled:opacity-50"
        >
          No thank you
        </button>
        <Button
          size="medium"
          className="min-w-[160px] rounded-xl bg-zinc-900 text-white hover:bg-zinc-900/90"
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
              Upgrade now
              {isFlexSelected === true ? ' with HSA/FSA' : ''}
            </>
          )}
        </Button>
        {isConfirmingPurchase && (
          <div className="w-[280px] duration-500 ease-out animate-in fade-in slide-in-from-bottom-3">
            <CurrentPaymentMethodCard className="rounded-xl px-3 py-2" />
          </div>
        )}
      </div>
    </div>
  );
}
