import { DialogTrigger } from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { Info, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { RxContract } from '@/types/api';

import { useCancelPlanChange } from '../api/change-plan';

// Lowercase the first character of a label so it reads correctly mid-sentence
// ("switching to every 6 months" vs "switching to Every 6 months").
const toPhrase = (label: string): string =>
  label ? label.charAt(0).toLowerCase() + label.slice(1) : '';

type Props = {
  contract: RxContract;
};

// Surfaces a scheduled plan change on the RX subscription detail page. Visual
// idiom matches CurrentPaymentMethodCard (rounded-2xl + border-zinc-200 +
// bg-white) so the card reads as part of the Shipping & billing group rather
// than as an alert. The cancel action is gated behind a confirmation dialog to
// prevent accidental undos.
export const PendingPlanChangeCard = ({ contract }: Props) => {
  const pendingLabel = contract.pendingPlanLabel ?? '';
  const pendingAmount = contract.pendingPlanAmount;
  const currentLabel = contract.currentPlanLabel ?? '';
  const currentAmount = contract.currentPlanAmount;
  const anchorDateLabel = contract.anchorDate
    ? format(new Date(contract.anchorDate), 'MMM do, yyyy')
    : null;

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <Body2 className="text-zinc-500">Scheduled plan change</Body2>
          <Body1 className="text-zinc-900">
            Switching to{' '}
            <span className="font-medium">{toPhrase(pendingLabel)}</span>
            {pendingAmount ? ` · ${pendingAmount}` : ''}
          </Body1>
          <Body2 className="text-secondary">
            {anchorDateLabel
              ? `Starts ${anchorDateLabel}`
              : 'Starts at your next billing cycle'}
          </Body2>
        </div>
        <CancelScheduledChangeDialog
          contractId={contract.id}
          pendingLabel={pendingLabel}
          currentLabel={currentLabel}
          currentAmount={currentAmount}
          anchorDateLabel={anchorDateLabel}
        >
          <Button variant="outline" size="small" className="shrink-0">
            Cancel change
          </Button>
        </CancelScheduledChangeDialog>
      </div>
    </div>
  );
};

// Confirmation dialog that mirrors PauseOrCancelRxSubscriptionDialog: full
// dialog on desktop, bottom-sheet on mobile. Prevents one-tap reversal of a
// plan change that may have involved non-trivial payment math.
const CancelScheduledChangeDialog = ({
  children,
  contractId,
  pendingLabel,
  currentLabel,
  currentAmount,
  anchorDateLabel,
}: {
  children: ReactNode;
  contractId: string;
  pendingLabel: string;
  currentLabel: string;
  currentAmount?: string;
  anchorDateLabel: string | null;
}) => {
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  const content = (
    <CancelScheduledChangeDialogContent
      contractId={contractId}
      pendingLabel={pendingLabel}
      currentLabel={currentLabel}
      currentAmount={currentAmount}
      anchorDateLabel={anchorDateLabel}
      closeModal={closeModal}
    />
  );

  if (width <= 768) {
    return (
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (next) setOpen(true);
          else closeModal();
        }}
      >
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px] p-6">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-[592px] px-14 py-16">
        <div className="fixed right-10 top-8">
          <DialogClose>
            <X className="size-6 cursor-pointer p-1" />
          </DialogClose>
        </div>
        {content}
      </DialogContent>
    </Dialog>
  );
};

const CancelScheduledChangeDialogContent = ({
  contractId,
  pendingLabel,
  currentLabel,
  currentAmount,
  anchorDateLabel,
  closeModal,
}: {
  contractId: string;
  pendingLabel: string;
  currentLabel: string;
  currentAmount?: string;
  anchorDateLabel: string | null;
  closeModal: () => void;
}) => {
  const cancelPlanChangeMutation = useCancelPlanChange({
    mutationConfig: {
      onSuccess: () => closeModal(),
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H2>Cancel scheduled plan change?</H2>
        <Body1 className="text-secondary">
          Your scheduled switch to{' '}
          <span className="font-medium text-zinc-900">
            {toPhrase(pendingLabel)}
          </span>{' '}
          will now be canceled.
        </Body1>
      </div>
      <div className="space-y-3 rounded-[20px] bg-zinc-100 p-4">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-vermillion-900" />
          <Body2 className="text-vermillion-900">
            What happens if you cancel?
          </Body2>
        </div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
            <Body2 className="text-secondary">
              You'll stay on{' '}
              <span className="font-medium text-zinc-900">
                {toPhrase(currentLabel)}
              </span>
            </Body2>
          </li>
          {currentAmount ? (
            <li className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
              <Body2 className="text-secondary">
                Your plan renews at{' '}
                <span className="font-medium text-zinc-900">
                  {currentAmount}
                </span>{' '}
                {anchorDateLabel
                  ? `on ${anchorDateLabel}`
                  : 'on your next billing cycle'}{' '}
                as usual
              </Body2>
            </li>
          ) : null}
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
            <Body2 className="text-secondary">
              You can schedule another change anytime
            </Body2>
          </li>
        </ul>
      </div>
      <div className="flex flex-col items-center justify-end gap-2.5 md:flex-row">
        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={closeModal}
          disabled={cancelPlanChangeMutation.isPending}
        >
          Keep scheduled change
        </Button>
        <Button
          className="w-full md:w-auto"
          onClick={() => cancelPlanChangeMutation.mutate(contractId)}
          disabled={cancelPlanChangeMutation.isPending}
        >
          {cancelPlanChangeMutation.isPending ? (
            <Spinner />
          ) : (
            'Cancel scheduled change'
          )}
        </Button>
      </div>
    </div>
  );
};
