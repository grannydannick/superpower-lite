import { AlertCircle, LucideInfo } from 'lucide-react';

import { Body2 } from '@/components/ui/typography';
import { ADDITIONAL_LAB_FEES, getAtHomePrice, US_STATES } from '@/const';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/utils/format-money';
import { getState } from '@/utils/verify-state-from-postal';

const NOTICE_STATES = ['NY', 'NJ', 'AZ'];
const SURCHARGE_STATES = ['NY', 'NJ'];

// This component is used to display a notice about the additional lab fee required for at-home collection
export const AtHomeNoticeSection = ({
  postalCode,
  atHomeDrawCredit = false,
  className,
}: {
  postalCode: string;
  atHomeDrawCredit?: boolean;
  className?: string;
}) => {
  const state = getState(postalCode);
  if (!state) return null;
  if (!NOTICE_STATES.includes(state.state)) return null;
  if (state.state === 'AZ' && atHomeDrawCredit) return null;

  const stateName = US_STATES.find((s) => s.value === state.state)?.label;
  if (!stateName) return null;

  const atHomePrice = getAtHomePrice(state.state);

  const nynjNotice = (
    <Body2 className="ml-6 text-zinc-400">
      {stateName} State has unique rules around blood test billing. To comply
      with these regulations, there is an additional annual fee of&nbsp;
      {formatMoney(ADDITIONAL_LAB_FEES[state.state])}. Blood draws are also done
      in the comfort of your own home via our at-home testing partners. An at
      home draw is an additional {formatMoney(atHomePrice)} which you will pay
      when scheduling your blood draw in a few steps.
    </Body2>
  );
  const azNotice = (
    <Body2 className="ml-6 text-zinc-400">
      Our Lab partner in {stateName} requires blood tests to be done in the
      comfort of your own home. An at home draw is an additional{' '}
      {formatMoney(atHomePrice)} which you will pay when scheduling your blood
      draw in a few steps.
    </Body2>
  );

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-zinc-200 bg-white p-3',
        className,
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <LucideInfo className="size-4 text-vermillion-900" />
        <Body2>Additional charge required for {stateName} State</Body2>
      </div>
      {state.state === 'NY' || state.state === 'NJ' ? nynjNotice : null}
      {state.state === 'AZ' ? azNotice : null}
    </div>
  );
};

export const AtHomeNoticeAlert = ({
  postalCode,
  className,
}: {
  postalCode: string;
  className?: string;
}) => {
  const state = getState(postalCode);
  if (!state) return null;

  if (!SURCHARGE_STATES.includes(state.state)) return null;

  const stateName = US_STATES.find((s) => s.value === state.state)?.label;
  if (!stateName) return null;

  return (
    <p className={cn('text-sm font-medium text-vermillion-700', className)}>
      <span className="flex items-center gap-3">
        <AlertCircle className="size-4 shrink-0 text-vermillion-700" />
        <span>
          {formatMoney(ADDITIONAL_LAB_FEES[state.state])} NY/NJ surcharge
          applied
        </span>
      </span>
    </p>
  );
};
