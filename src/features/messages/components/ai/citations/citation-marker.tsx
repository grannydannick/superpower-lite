import { memo } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CitationMarkerProps {
  messageId: string;
  number: number;
  tooltip?: string;
}

export const CitationMarker = memo(function CitationMarker({
  messageId,
  number,
  tooltip,
}: CitationMarkerProps) {
  const targetId = `${messageId}-citation-${number}`;

  // Citations without tooltip are clickable links (e.g., biomarkers)
  if (!tooltip) {
    return (
      <a
        href={`#${targetId}`}
        className="inline-flex items-center justify-center rounded bg-[#ffebe0] px-1.5 py-0.5 text-[12px] font-normal leading-[17px] tracking-[0.06px] text-[#fc5f2b] no-underline transition-colors hover:bg-[#ffd9c7] focus:outline-2 focus:outline-[#fc5f2b]"
        aria-describedby={targetId}
      >
        {number}
      </a>
    );
  }

  // Citations with tooltip are not links - just show tooltip on hover
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-pointer items-center justify-center rounded bg-[#ffebe0] px-1.5 py-0.5 text-[12px] font-normal leading-[17px] tracking-[0.06px] text-[#fc5f2b]">
            {number}
          </span>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side="top" className="max-w-xs text-xs">
            {tooltip}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
});
