import { format } from 'date-fns';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { ExtractionCounts, FileExtraction } from '@/types/api';

const EXTRACTION_ISSUE_COPY: Record<
  keyof NonNullable<ExtractionCounts['issues']>,
  string
> = {
  skippedNoLoincMatch: 'could not be matched to a known lab test',
  skippedValueTypeMismatch:
    'used a result format that did not match the expected format for that lab test',
  skippedUnparseableQuantityValue:
    'included a numeric value that could not be read reliably',
  skippedAmbiguousValue:
    'could not be matched confidently to one specific lab test',
};

interface ExtractionSummaryProps {
  extraction: FileExtraction;
  className?: string;
  withTooltip?: boolean;
}

export function ExtractionSummary({
  extraction,
  className,
  withTooltip = false,
}: ExtractionSummaryProps) {
  if (extraction.status !== 'final') return null;

  let summary = 'No results saved';
  let written = 0;
  let flagged = 0;
  let skipped = 0;
  const issueNodes: React.ReactNode[] = [];

  if (extraction.counts != null) {
    written = extraction.counts.written;
    flagged = extraction.counts.flagged;
    skipped = extraction.counts.skipped;

    if (written > 0) {
      summary = `${written} result${written !== 1 ? 's' : ''} saved`;
    }

    const issues = extraction.counts.issues;
    if (issues != null) {
      const issueKeys: Array<keyof typeof EXTRACTION_ISSUE_COPY> = [
        'skippedNoLoincMatch',
        'skippedValueTypeMismatch',
        'skippedUnparseableQuantityValue',
        'skippedAmbiguousValue',
      ];

      for (const issueKey of issueKeys) {
        const issueCount = issues[issueKey];
        if (typeof issueCount !== 'number' || issueCount <= 0) continue;
        issueNodes.push(
          <div key={issueKey} className="leading-5 text-zinc-200">
            {issueCount} {EXTRACTION_ISSUE_COPY[issueKey]}
          </div>,
        );
      }
    }
  }

  const summaryNode = (
    <Body3
      className={cn(
        'text-zinc-500',
        withTooltip &&
          'cursor-pointer underline decoration-zinc-300 decoration-dotted underline-offset-4 transition-colors hover:text-zinc-700 hover:decoration-zinc-400',
        className,
      )}
    >
      {summary}
    </Body3>
  );

  if (!withTooltip) {
    return summaryNode;
  }
  const importedLabel =
    written === 1 ? 'Imported 1 lab result' : `Imported ${written} lab results`;
  const outOfRangeLabel =
    flagged === 1 ? '1 was out of range' : `${flagged} were out of range`;
  const skippedLabel =
    skipped === 1 ? '1 was not added' : `${skipped} were not added`;
  const reportDateLabel =
    extraction.reportDate == null
      ? null
      : `Report date: ${format(new Date(extraction.reportDate), 'MMM d, yyyy')}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-fit">{summaryNode}</div>
        </TooltipTrigger>
        <TooltipContent className="max-w-80">
          {extraction.counts == null ? (
            <div className="leading-5 text-zinc-200">
              No detailed ingestion stats available.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="font-medium leading-5 text-white">
                  {importedLabel}
                </div>
                {flagged > 0 ? (
                  <div className="leading-5 text-zinc-200">
                    {outOfRangeLabel}
                  </div>
                ) : null}
                {skipped > 0 ? (
                  <div className="leading-5 text-amber-200">{skippedLabel}</div>
                ) : null}
              </div>
              {issueNodes.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-xs leading-5 text-zinc-300">
                    Some reasons included:
                  </div>
                  {issueNodes}
                </div>
              ) : null}
              {reportDateLabel == null ? null : (
                <div className="text-xs leading-5 text-zinc-400">
                  {reportDateLabel}
                </div>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
