import { DialogTrigger } from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { Check, Info, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Body1, Body2, H2, H3 } from '@/components/ui/typography';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { RxSubscription } from '@/types/api';
import {
  formatCentsAsUSD,
  getBillingMonthsFromInterval,
  getPerMonthCents,
} from '@/utils/plan-pricing';

import {
  PlanOption,
  useCancelPlanChange,
  useChangePlan,
  usePlanOptions,
} from '../api/change-plan';

// Lowercase the first character so a server-provided label reads naturally
// mid-sentence: "switching to every 6 months" rather than "Every 6 months".
const toPhrase = (label: string): string =>
  label ? label.charAt(0).toLowerCase() + label.slice(1) : '';

const formatDaysSupply = (days: number): string => `${days}-day supply`;

const getBasePerMonthCents = (options: PlanOption[] | undefined): number => {
  if (!options?.length) return 0;
  const monthly = options.find((o) => o.interval_count <= 30);
  if (!monthly) return 0;
  return getPerMonthCents(monthly.amount, monthly.interval_count);
};

const getSavingsPercent = (
  option: PlanOption,
  basePerMonthCents: number,
): number => {
  if (basePerMonthCents <= 0) return 0;
  if (option.interval_count <= 30) return 0;
  const perMonth = getPerMonthCents(option.amount, option.interval_count);
  return Math.round((1 - perMonth / basePerMonthCents) * 100);
};

export const ChangePlanDialog = ({
  children,
  subscription,
}: {
  children: ReactNode;
  subscription: RxSubscription;
}) => {
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(false);

  const closeModal = () => setOpen(false);

  const content = (
    <ChangePlanDialogContent
      subscription={subscription}
      closeModal={closeModal}
    />
  );

  if (width <= 768) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col overflow-y-auto rounded-t-[10px] p-6">
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

const ChangePlanDialogContent = ({
  closeModal,
  subscription,
}: {
  closeModal: () => void;
  subscription: RxSubscription;
}) => {
  const [selectedBillingCode, setSelectedBillingCode] = useState<string>('');
  const [confirmed, setConfirmed] = useState<PlanOption | null>(null);

  const contractId = subscription.contract.id;

  const planOptionsQuery = usePlanOptions({ contractId });
  const changePlanMutation = useChangePlan();
  const cancelPlanChangeMutation = useCancelPlanChange();

  const planData = planOptionsQuery.data;
  const selectedOption = planData?.options.find(
    (o) => o.billing_code === selectedBillingCode,
  );
  const pendingOption = planData?.options.find(
    (o) => o.billing_code === planData.pending_billing_code,
  );
  const basePerMonthCents = getBasePerMonthCents(planData?.options);

  const anchorDate = subscription.contract.anchorDate
    ? new Date(subscription.contract.anchorDate)
    : null;

  if (confirmed) {
    return (
      <ChangePlanConfirmation
        option={confirmed}
        anchorDate={anchorDate}
        closeModal={closeModal}
      />
    );
  }

  const handleSubmit = async () => {
    if (!selectedOption) return;
    await changePlanMutation.mutateAsync({
      id: contractId,
      billingCode: selectedOption.billing_code,
    });
    setConfirmed(selectedOption);
  };

  const handleCancelPending = () => {
    cancelPlanChangeMutation.mutate(contractId);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H2>Change plan</H2>
        <Body1 className="text-secondary">
          Pick a new billing cadence for{' '}
          <span className="font-medium text-zinc-900">
            {planData?.medication_name ??
              subscription.medicationRequest?.medicationDisplay ??
              'your prescription'}
          </span>
          . Changes take effect at your next billing cycle. No mid-cycle
          charges.
        </Body1>
      </div>

      {planData?.pending_billing_code ? (
        <div className="space-y-3 rounded-[20px] bg-zinc-100 p-4">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-vermillion-900" />
            <Body2 className="text-vermillion-900">
              Plan change already scheduled
            </Body2>
          </div>
          <Body2 className="text-secondary">
            Switching to{' '}
            <span className="font-medium text-zinc-900">
              {toPhrase(pendingOption?.plan_label ?? '')}
            </span>
            {anchorDate
              ? ` on ${format(anchorDate, 'MMM do, yyyy')}`
              : ' at next billing cycle'}
            .
          </Body2>
          <Button
            variant="outline"
            size="small"
            onClick={handleCancelPending}
            disabled={cancelPlanChangeMutation.isPending}
          >
            {cancelPlanChangeMutation.isPending ? (
              <Spinner />
            ) : (
              'Cancel scheduled change'
            )}
          </Button>
        </div>
      ) : null}

      <div className="space-y-2">
        {planOptionsQuery.isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : null}
        {planData?.options.map((option) => (
          <PlanOptionCard
            key={option.billing_code}
            option={option}
            basePerMonthCents={basePerMonthCents}
            isSelected={selectedBillingCode === option.billing_code}
            isPending={planData.pending_billing_code === option.billing_code}
            onSelect={() => {
              if (option.is_current) return;
              if (planData.pending_billing_code === option.billing_code) return;
              setSelectedBillingCode(option.billing_code);
            }}
          />
        ))}
      </div>

      {selectedOption ? (
        <div className="space-y-1 rounded-[20px] bg-zinc-100 px-4 py-3">
          <Body2 className="text-secondary">
            You'll be charged{' '}
            <span className="font-medium text-zinc-900">
              {selectedOption.plan_amount}
            </span>
            {anchorDate ? (
              <>
                {' '}
                on{' '}
                <span className="font-medium text-zinc-900">
                  {format(anchorDate, 'MMM do, yyyy')}
                </span>
              </>
            ) : (
              ' at your next billing cycle'
            )}
            . After that, you'll be billed every {selectedOption.interval_count}{' '}
            days.
          </Body2>
        </div>
      ) : null}

      <div className="flex flex-col items-center justify-end gap-2.5 md:flex-row">
        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={closeModal}
          disabled={changePlanMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          className="w-full md:w-auto"
          disabled={!selectedOption || changePlanMutation.isPending}
          onClick={handleSubmit}
        >
          {changePlanMutation.isPending ? <Spinner /> : 'Confirm plan change'}
        </Button>
      </div>
    </div>
  );
};

const PlanOptionCard = ({
  option,
  basePerMonthCents,
  isSelected,
  isPending,
  onSelect,
}: {
  option: PlanOption;
  basePerMonthCents: number;
  isSelected: boolean;
  isPending: boolean;
  onSelect: () => void;
}) => {
  const isDisabled = option.is_current || isPending;
  const isLocked = option.is_current || isPending;
  const borderClass = isLocked
    ? 'border-zinc-200 bg-zinc-50'
    : isSelected
      ? 'border-vermillion-900 bg-vermillion-50'
      : 'border-zinc-200';

  const perMonthCents = getPerMonthCents(option.amount, option.interval_count);
  const perMonthLabel = `${formatCentsAsUSD(perMonthCents)}/mo`;
  const savingsPercent = getSavingsPercent(option, basePerMonthCents);
  const months = getBillingMonthsFromInterval(option.interval_count);
  const showBreakdown = isSelected && option.interval_count > 30;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${borderClass} ${
        isDisabled ? 'cursor-not-allowed' : 'hover:border-zinc-400'
      }`}
    >
      <div
        className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border ${
          isLocked
            ? 'border-zinc-300 bg-zinc-200'
            : isSelected
              ? 'border-vermillion-900 bg-vermillion-900 text-white'
              : 'border-zinc-300'
        }`}
      >
        {isLocked ? (
          <span className="size-1.5 rounded-full bg-zinc-400" />
        ) : isSelected ? (
          <Check className="size-3" />
        ) : null}
      </div>
      <div className="flex w-full flex-col">
        <div className="flex items-baseline justify-between gap-4">
          <Body1 className="font-medium">
            {option.plan_label}
            {option.is_current ? ' · Current plan' : ''}
            {isPending ? ' · Scheduled' : ''}
          </Body1>
          <div className="flex shrink-0 items-center gap-2">
            {savingsPercent > 0 && (
              <Badge variant="vermillion" className="py-0.5 text-xs">
                Save {savingsPercent}%
              </Badge>
            )}
            <Body1 className="font-semibold">{perMonthLabel}</Body1>
          </div>
        </div>
        <Body2 className="text-secondary">
          {formatDaysSupply(option.days_supply)}
        </Body2>
        {showBreakdown && (
          <div className="mt-2 flex items-baseline justify-between border-t border-zinc-200 pt-2">
            <Body2 className="text-secondary">Total</Body2>
            <Body2 className="text-secondary">
              {perMonthLabel} &times; {months} ={' '}
              <span className="font-semibold text-primary">
                {option.plan_amount}
              </span>
            </Body2>
          </div>
        )}
      </div>
    </button>
  );
};

const ChangePlanConfirmation = ({
  option,
  anchorDate,
  closeModal,
}: {
  option: PlanOption;
  anchorDate: Date | null;
  closeModal: () => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-vermillion-50">
          <Check className="size-8 text-vermillion-900" />
        </div>
        <H3>Plan change scheduled</H3>
        <Body1 className="text-secondary">
          Your plan will switch to{' '}
          <span className="font-medium text-zinc-900">
            {toPhrase(option.plan_label)}
          </span>
          {anchorDate ? (
            <>
              {' '}
              on{' '}
              <span className="font-medium text-zinc-900">
                {format(anchorDate, 'MMM do, yyyy')}
              </span>
            </>
          ) : (
            ' at your next billing cycle'
          )}
          . You'll be charged{' '}
          <span className="font-medium text-zinc-900">
            {option.plan_amount}
          </span>
          . You can cancel this change anytime before then.
        </Body1>
      </div>
      <div className="flex justify-center">
        <Button className="w-full md:w-auto" onClick={closeModal}>
          Done
        </Button>
      </div>
    </div>
  );
};
