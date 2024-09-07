import { format } from 'date-fns';
import { Ellipsis } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useStepper } from '@/components/ui/stepper';
import { useMembershipPrice } from '@/features/settings/api';
import { useCancelMembership } from '@/features/settings/api/cancel-membership';
import { useMembership } from '@/features/settings/stores/membership-store';
import { formatMoney } from '@/utils/format-money';

export const ConfirmationStep = (): JSX.Element => {
  const { data: subscriptionPriceData } = useMembershipPrice({});
  const { nextStep } = useStepper((s) => s);
  const { daysRemaining, startDate, endDate } = useMembership((s) => s);
  const cancelMembershipMutation = useCancelMembership();

  return (
    <div className="flex flex-col gap-12">
      <div className="space-y-10">
        <div className="mt-4 space-y-4">
          <h1 className="max-w-[444px] text-3xl">
            Please confirm your membership cancellation
          </h1>
          <p className="text-zinc-600">
            You have{' '}
            <span className="text-vermillion-700">{daysRemaining} days</span> to
            enjoy your membership benefits until the next billing cycle.{' '}
          </p>
        </div>
        <section id="membership-card" className="space-y-4">
          <div className="flex items-start justify-between rounded-[20px] border border-[#E4E4E7] p-6">
            <div className="flex flex-col gap-3 md:flex-row">
              <img
                alt="superpower_blood_panel"
                src="/services/superpower_blood_panel.png"
                className="size-20 rounded-[8px] border border-[#E4E4E7] object-cover object-center md:size-12"
              />
              <div className="flex flex-col justify-center">
                <p className="text-xl md:text-sm">
                  Superpower Baseline Membership
                </p>
                <div className="flex flex-col gap-2 text-[#71717A] md:flex-row md:items-center">
                  <p className="text-sm">
                    Annual {formatMoney(subscriptionPriceData?.total || 0)}
                  </p>
                  <Ellipsis
                    className="hidden size-0.5 md:block"
                    fill="#71717A"
                  />
                  {startDate && endDate && (
                    <p className="text-sm">
                      {format(startDate, 'PP')} - {format(endDate, 'PP')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <BestValueBadge />
          </div>
        </section>
      </div>
      <div className="flex w-full justify-end">
        <Button
          onClick={async () => {
            await cancelMembershipMutation.mutateAsync(undefined);
            nextStep();
          }}
        >
          {cancelMembershipMutation.isPending ? (
            <Spinner />
          ) : (
            `End on ${endDate ? format(endDate, 'PP') : 'closest date'}`
          )}
        </Button>
      </div>
    </div>
  );
};

const BestValueBadge = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center rounded-[6px] bg-[#FFEDD5] px-2 py-1">
      <p className="text-nowrap text-xs text-[#FC5F2B]">Best Value</p>
    </div>
  );
};
