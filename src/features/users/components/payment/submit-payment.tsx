import { CircleCheckBig } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { TransactionSpinner } from '@/components/ui/spinner/transaction-spinner';
// eslint-disable-next-line import/no-restricted-paths
import { usePaymentMethodSelection } from '@/features/settings/hooks';

interface SubmitPaymentProps {
  /** Callback when the submit button is clicked */
  onSubmit: (paymentMethodId: string) => void;
  /** Callback when the cancel button is clicked */
  onCancel: () => void;
  /** Text for the submit button */
  submitLabel: string;
  /** Text for the cancel button (defaults to "No thanks") */
  cancelLabel?: string;
  /** Whether the submit action is pending */
  isPending?: boolean;
  /** Whether the submit action was successful */
  isSuccess?: boolean;
  /** Whether the submit payment button should be enabled */
  enabled?: boolean;
}

export const SubmitPayment = ({
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = 'No thanks',
  isPending = false,
  isSuccess = false,
  enabled = false,
}: SubmitPaymentProps) => {
  const {
    isFlexSelected,
    hasFlexPaymentMethod,
    activePaymentMethodId,
    isSelectingPaymentMethod,
    startSelectingPaymentMethod,
  } = usePaymentMethodSelection();

  const showLoading = isPending || isSuccess;
  const showFlexSelectionButton =
    enabled && hasFlexPaymentMethod && !activePaymentMethodId;

  const submitEnabled =
    enabled &&
    !isSelectingPaymentMethod &&
    !isPending &&
    !!activePaymentMethodId;

  const handleSubmit = useCallback(() => {
    if (activePaymentMethodId) {
      onSubmit(activePaymentMethodId);
    }
  }, [onSubmit, activePaymentMethodId]);

  return (
    <div className="flex flex-col gap-2">
      <Button disabled={!submitEnabled} onClick={handleSubmit}>
        {showLoading ? (
          <TransactionSpinner className="flex justify-center" />
        ) : (
          <>
            {submitEnabled && isFlexSelected && (
              <CircleCheckBig className="mr-2 size-[20px]" />
            )}
            {submitLabel}
            {submitEnabled && isFlexSelected ? ' with HSA/FSA' : ''}
          </>
        )}
      </Button>
      {showFlexSelectionButton && (
        <Button
          variant="outline"
          className="bg-white"
          onClick={startSelectingPaymentMethod}
        >
          <CircleCheckBig className="mr-2 size-[20px] text-zinc-700" />
          Select HSA/FSA card
        </Button>
      )}
      <Button
        variant={enabled && activePaymentMethodId ? 'outline' : 'white'}
        className="bg-white"
        disabled={isPending}
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
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
  );
};
