export interface BundlePickerPurchaseInteraction {
  isPending: boolean;
  isConfirmingPurchase: boolean;
  isSelectingPaymentMethod: boolean;
  hasPaymentMethod: boolean;
  isFlexSelected: boolean;
  onSkip: () => void;
  onUpgradeCta: () => void | Promise<void>;
}

interface BundlePickerCtaDisableInput {
  isPending: boolean;
  isConfirmingPurchase: boolean;
  isSelectingPaymentMethod: boolean;
  hasPaymentMethod: boolean;
}

export function bundlePickerCtaDisabled(input: BundlePickerCtaDisableInput) {
  if (input.isPending) return true;
  if (!input.isConfirmingPurchase) return false;
  if (input.isSelectingPaymentMethod) return true;
  if (!input.hasPaymentMethod) return true;
  return false;
}
