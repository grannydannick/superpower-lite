import { ChevronRight } from 'lucide-react';
import { memo } from 'react';

import { formatJsonIfValid } from '@/features/messages/utils/json';

import type { CitationInfo } from '../../../types/message-parts';

interface CitationCardProps {
  messageId: string;
  citation: CitationInfo;
}

export const CitationCard = memo(function CitationCard({
  messageId,
  citation,
}: CitationCardProps) {
  const cardId = `${messageId}-citation-${citation.number}`;

  // Truncate source for collapsed view
  const truncatedSource =
    citation.source.length > 40
      ? `${citation.source.slice(0, 40)}…`
      : citation.source;

  return (
    <details
      id={cardId}
      className="group scroll-mt-4 text-[11px]"
      role="note"
      aria-label={`Citation ${citation.number}: ${citation.title}`}
    >
      <summary className="flex cursor-pointer select-none items-center gap-1.5 py-0.5 font-mono text-zinc-500 hover:text-zinc-700">
        <ChevronRight className="size-3 shrink-0 transition-transform group-open:rotate-90" />
        <span className="shrink-0 font-semibold text-zinc-700">
          [{citation.number}]
        </span>
        <span className="truncate">{truncatedSource}</span>
        {citation.title && citation.title !== citation.source ? (
          <>
            <span className="shrink-0 text-zinc-400">—</span>
            <span className="truncate text-zinc-600">{citation.title}</span>
          </>
        ) : null}
      </summary>
      <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-zinc-200 pl-3">
        <div className="text-[10px] text-zinc-400">
          source: {citation.source}
        </div>
        {citation.citedText ? (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 px-2 py-1 font-mono text-[10px] text-zinc-700">
            {formatJsonIfValid(citation.citedText)}
          </pre>
        ) : null}
      </div>
    </details>
  );
});
