import { LucideInfo } from 'lucide-react';

import { Body2 } from '@/components/ui/typography';
import { US_STATES, ADDITIONAL_LAB_FEES } from '@/const';
import { useUser } from '@/lib/auth';

// This component is used to display a notice about the additional lab fee required for at-home collection
export const AtHomeNoticeSection = ({
  fallbackState,
}: {
  fallbackState?: string;
}) => {
  const { data: user } = useUser();

  const state = user?.primaryAddress?.state ?? fallbackState;
  if (!state) return null;

  const stateName = US_STATES.find((s) => s.value === state)?.label;
  if (!stateName) return null;

  const fee = ADDITIONAL_LAB_FEES[state];

  if (!fee) return null;

  return (
    <div className="w-full rounded-xl border border-zinc-200 p-3">
      <div className="mb-1 flex items-center gap-2">
        <LucideInfo className="size-4 text-vermillion-900" />
        <Body2>Additional charge required for {stateName} State</Body2>
      </div>
      <Body2 className="ml-6 text-zinc-400">
        {stateName} State has unique rules around blood test billing. To comply
        with these regulations, there is an additional annual fee of ${fee}.
        Blood draws are also done in the comfort of your own home via our
        at-home testing partners.
      </Body2>
    </div>
  );
};
