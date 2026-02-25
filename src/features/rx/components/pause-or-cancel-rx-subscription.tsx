import { DialogTrigger } from '@radix-ui/react-dialog';
import { Info, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { RxSubscription } from '@/types/api';

import { useCancelSubscription } from '../api/cancel-subscription';
import { usePauseSubscription } from '../api/pause-subscription';

export const PauseOrCancelRxSubscriptionDialog = ({
  children,
  flow,
  subscription,
}: {
  children: ReactNode;
  flow: 'pause' | 'cancel';
  subscription: RxSubscription;
}) => {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState(flow);
  const [open, setOpen] = useState(false);

  const content =
    mode === 'pause' ? (
      <PauseSubscriptionDialogContent
        subscription={subscription}
        setMode={() => setMode('cancel')}
        closeModal={() => setOpen(false)}
      />
    ) : (
      <CancelSubscriptionDialogContent
        subscription={subscription}
        setMode={() => setMode('pause')}
        closeModal={() => setOpen(false)}
      />
    );

  if (width <= 768) {
    return (
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setMode(flow);
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setMode(flow);
      }}
    >
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

const PauseSubscriptionDialogContent = ({
  setMode,
  closeModal,
  subscription,
}: {
  setMode: () => void;
  closeModal: () => void;
  subscription: RxSubscription;
}) => {
  const pauseSubscriptionMutation = usePauseSubscription({
    mutationConfig: {
      onSuccess: () => {
        closeModal();
      },
    },
  });

  const isCancellable =
    subscription.contract.billingCycleStatus !== 'cancelled';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H2>Pause subscription</H2>
        <Body1 className="text-secondary">
          Temporarily pause your subscription. You won’t be charged while paused
          & can resume anytime.
        </Body1>
      </div>
      <div className="space-y-3 rounded-[20px] bg-zinc-100 p-4">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-vermillion-900" />
          <Body2 className="text-vermillion-900">
            What happen’s once you pause?
          </Body2>
        </div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
            <Body2 className="text-secondary">
              No charges during pause period
            </Body2>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
            <Body2 className="text-secondary">No shipments will be sent</Body2>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
            <Body2 className="text-secondary">
              Resume anytime from your dashboard
            </Body2>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
            <Body2 className="text-secondary">
              Your progress and treatment plan are saved
            </Body2>
          </li>
        </ul>
      </div>
      <div className="flex flex-col items-center justify-end gap-2.5 md:flex-row">
        {isCancellable ? (
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={setMode}
            disabled={pauseSubscriptionMutation.isPending}
          >
            Cancel Subscription
          </Button>
        ) : null}
        <Button
          className="w-full md:w-auto"
          onClick={() =>
            pauseSubscriptionMutation.mutate(subscription.contract.id)
          }
        >
          {pauseSubscriptionMutation.isPending ? <Spinner /> : 'Confirm Pause'}
        </Button>
      </div>
    </div>
  );
};

const CancelSubscriptionDialogContent = ({
  setMode,
  closeModal,
  subscription,
}: {
  setMode: () => void;
  closeModal: () => void;
  subscription: RxSubscription;
}) => {
  const cancelSubscriptionMutation = useCancelSubscription({
    mutationConfig: {
      onSuccess: () => {
        closeModal();
      },
    },
  });

  const isPausable =
    subscription.contract.billingCycleStatus !== 'paused' &&
    subscription.contract.billingCycleStatus !== 'cancelled';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H2>Cancel subscription</H2>
        <Body1 className="text-secondary">
          We’re sorry to see you go. Please help us understand why you are
          cancelling.
        </Body1>
      </div>
      <div className="space-y-3 rounded-[20px] bg-zinc-100 p-4">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-vermillion-900" />
          <Body2 className="text-vermillion-900">Before you cancel</Body2>
        </div>
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
            <Body2 className="text-secondary">
              You will receive no future refills or charges
            </Body2>
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-zinc-300" />
            <Body2 className="text-secondary">
              You’ll lose access to your treatment plan
            </Body2>
          </li>
        </ul>
      </div>
      <div className="flex flex-col items-center justify-end gap-2.5 md:flex-row">
        {isPausable ? (
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={setMode}
            disabled={cancelSubscriptionMutation.isPending}
          >
            Pause instead
          </Button>
        ) : null}
        <Button
          className="w-full md:w-auto"
          disabled={cancelSubscriptionMutation.isPending}
          onClick={() =>
            cancelSubscriptionMutation.mutate(subscription.contract.id)
          }
        >
          {cancelSubscriptionMutation.isPending ? (
            <Spinner />
          ) : (
            'Confirm Cancellation'
          )}
        </Button>
      </div>
    </div>
  );
};
