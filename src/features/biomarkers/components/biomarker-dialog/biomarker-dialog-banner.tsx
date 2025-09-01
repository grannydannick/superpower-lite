import { AlertTriangle } from 'lucide-react';

import { Body2, H4 } from '@/components/ui/typography';
import { BiomarkerResult } from '@/types/api';

interface BiomarkerDialogBannerProps {
  biomarkerName: string;
  result: BiomarkerResult;
}

export const BiomarkerDialogBanner = ({
  biomarkerName,
  result,
}: BiomarkerDialogBannerProps) => {
  const hasLessThanComparator = result.quantity.comparator === 'LESS_THAN';

  if (!hasLessThanComparator) return null;

  return (
    <div className="sticky top-6 z-10 mx-6 mb-4 flex max-w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-md shadow-black/5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#FC5F2B20]">
        <AlertTriangle className="size-5 text-vermillion-900" />
      </div>
      <div>
        <H4 className="text-left text-base">Lab precision note</H4>
        <Body2 className="text-left text-secondary">
          Your {biomarkerName} result shows the best possible outcome within the
          lab&apos;s detection limits. The actual value may be even better than
          reported.
        </Body2>
      </div>
    </div>
  );
};
