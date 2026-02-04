import { memo } from 'react';

import { SparklineChart } from '@/components/ui/charts/sparkline-chart/sparkline-chart';
import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import { Body2 } from '@/components/ui/typography';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { BiomarkerDialog } from '@/features/data/components/dialogs/biomarker-dialog';
import { cn } from '@/lib/utils';
import type { Biomarker } from '@/types/api';

import type { CitationInfo } from '../../../types/message-parts';

interface BiomarkerCitationCardProps {
  messageId: string;
  citation: CitationInfo;
  biomarker: Biomarker;
}

/**
 * Biomarker card for FHIR Observation citations.
 * Shows citation number, status, value, range, and sparkline.
 */
export const BiomarkerCitationCard = memo(function BiomarkerCitationCard({
  messageId,
  citation,
  biomarker,
}: BiomarkerCitationCardProps) {
  const cardId = `${messageId}-citation-${citation.number}`;
  const { status, name } = biomarker;

  const statusColor =
    STATUS_TO_COLOR[status.toLowerCase() as keyof typeof STATUS_TO_COLOR] ||
    STATUS_TO_COLOR.pending;

  const currentValue = biomarker.value?.[0];

  const formatCurrentValue = () => {
    if (!currentValue?.quantity) return null;

    const { value, unit } = currentValue.quantity;
    const displayUnit = unit || biomarker.unit;

    return (
      <>
        <span className="text-zinc-900">{value}</span>{' '}
        <span className="text-zinc-400">{displayUnit}</span>
      </>
    );
  };

  const formatRange = () => {
    const { ranges } = getBiomarkerRanges(biomarker);
    const optimalRange = ranges.find((r) => r.status === 'OPTIMAL');

    if (!optimalRange) return null;

    const { low, high } = optimalRange;

    if (low && high) {
      return `${low.value} - ${high.value}`;
    } else if (low) {
      return `≥ ${low.value}`;
    } else if (high) {
      return `≤ ${high.value}`;
    }

    return null;
  };

  const rangeText = formatRange();

  return (
    <BiomarkerDialog biomarker={biomarker}>
      <div
        id={cardId}
        role="note"
        aria-label={`Citation ${citation.number}: ${name}`}
        className={cn(
          'flex h-[76px] items-center justify-between overflow-clip scroll-mt-4',
          'rounded-[20px] border border-zinc-200 bg-white',
          'shadow-[0px_2px_2px_0px_rgba(0,0,0,0.02)]',
          'cursor-pointer transition-all hover:border-zinc-300',
        )}
      >
        {/* Name with citation number prefix */}
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center p-4">
          <p className="flex w-full gap-1 text-sm leading-5 text-zinc-900">
            <span className="text-zinc-400">{citation.number} - </span>
            <span className="line-clamp-1">{name}</span>
          </p>
        </div>

        {/* Status */}
        <div className="flex shrink-0 flex-col items-start justify-center px-4">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: statusColor }}
              className="size-2 rounded-full"
            />
            <Body2
              style={{ color: statusColor }}
              className="text-xs capitalize"
            >
              {status.toLowerCase()}
            </Body2>
          </div>
        </div>

        {/* Value */}
        <div className="hidden shrink-0 flex-col items-start justify-center px-3 sm:flex">
          <Body2 className="text-xs">{formatCurrentValue()}</Body2>
        </div>

        {/* Range pill */}
        {rangeText && (
          <div className="hidden shrink-0 flex-col items-start justify-center px-4 md:flex">
            <div className="rounded-lg bg-zinc-100 px-2 py-0.5">
              <Body2 className="text-xs text-zinc-500">{rangeText}</Body2>
            </div>
          </div>
        )}

        {/* Sparkline */}
        <div className="h-[52px] w-[150px] shrink-0 pr-4">
          <SparklineChart biomarker={biomarker} />
        </div>
      </div>
    </BiomarkerDialog>
  );
});
