import { memo } from 'react';

import { SparklineChart } from '@/components/ui/charts/sparkline-chart/sparkline-chart';
import { getBiomarkerRanges } from '@/components/ui/charts/utils/get-biomarker-ranges';
import { Body2 } from '@/components/ui/typography';
import { STATUS_TO_COLOR } from '@/const/status-to-color';
import { BiomarkerDialog } from '@/features/data/components/dialogs/biomarker-dialog';
import type { DataBiomarker } from '@/features/data/types/data-api';
import { cn } from '@/lib/utils';

import type { CitationInfo } from '../../../types/message-parts';

interface BiomarkerCitationCardProps {
  messageId: string;
  citation: CitationInfo;
  biomarker: DataBiomarker;
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
  const observation = biomarker.observation;
  const name = biomarker.title;

  const statusColor = observation
    ? STATUS_TO_COLOR[
        observation.status.toLowerCase() as keyof typeof STATUS_TO_COLOR
      ] || STATUS_TO_COLOR.pending
    : STATUS_TO_COLOR.pending;

  const currentValue = observation?.value?.[0];

  const formatCurrentValue = () => {
    if (!currentValue?.quantity || !observation) return null;

    const { value, unit } = currentValue.quantity;
    const displayUnit = unit || observation.unit;

    return (
      <>
        <span className="text-zinc-900">{value}</span>{' '}
        <span className="text-zinc-400">{displayUnit}</span>
      </>
    );
  };

  const formatRange = () => {
    if (!observation) return null;
    const { ranges } = getBiomarkerRanges(observation);
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
    <BiomarkerDialog biomarkerId={biomarker.id}>
      <div
        id={cardId}
        role="note"
        aria-label={`Citation ${citation.number}: ${name}`}
        className={cn(
          'flex h-[76px] scroll-mt-4 items-center justify-between overflow-clip',
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
        {observation && (
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
                {observation.status.toLowerCase()}
              </Body2>
            </div>
          </div>
        )}

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
        {observation && (
          <div className="h-[52px] w-[150px] shrink-0 pr-4">
            <SparklineChart biomarker={observation} />
          </div>
        )}
      </div>
    </BiomarkerDialog>
  );
});
