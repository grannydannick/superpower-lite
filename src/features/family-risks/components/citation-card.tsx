import { ExternalLink } from 'lucide-react';

import { Body2, Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { FamilyRiskCitation } from '../api';

export const CitationCard = ({
  citation,
}: {
  citation: FamilyRiskCitation;
}) => {
  const doiUrl = citation.doi ? `https://doi.org/${citation.doi}` : null;

  // Not useful without
  if (!doiUrl) {
    return null;
  }

  return (
    <a
      href={doiUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm transition-colors',
        'hover:bg-zinc-50',
      )}
    >
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
        <img
          src="/family-risk/paper.webp"
          className="h-12 transition-all ease-out group-hover:rotate-3 group-hover:scale-105"
          alt="Research paper"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <Body2 className="line-clamp-2 font-medium">{citation.title}</Body2>
        <Body3 className="text-zinc-500">
          {citation.authors} - {citation.journal} ({citation.year})
        </Body3>
      </div>
      <ExternalLink className="mr-4 size-4 shrink-0 text-zinc-400" />
    </a>
  );
};
