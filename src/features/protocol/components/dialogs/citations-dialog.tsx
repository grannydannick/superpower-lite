import { ExternalLink, X } from 'lucide-react';
import { ReactNode, useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Body1, Body2, Body3, H3 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import type { ProtocolCitation } from '../../api';

type CitationsDialogProps = {
  children: ReactNode;
  citations: ProtocolCitation[];
};

export function CitationCard({
  citation,
  onLinkClick,
}: {
  citation: ProtocolCitation;
  onLinkClick?: () => void;
}) {
  const href =
    citation.url || (citation.doi ? `https://doi.org/${citation.doi}` : null);

  const meta = [citation.authors, citation.journal, citation.year]
    .filter(Boolean)
    .join(' - ');

  const content = (
    <>
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
        <img
          src="/family-risk/paper.webp"
          className="h-12 transition-all ease-out group-hover:rotate-3 group-hover:scale-105"
          alt="Research paper"
        />
      </div>
      <div className="flex-1 space-y-0.5">
        <Body2 className="line-clamp-2 font-medium">{citation.title}</Body2>
        {meta && <Body3 className="text-zinc-500">{meta}</Body3>}
      </div>
    </>
  );

  if (!href) {
    return (
      <div className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-1 pl-2 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClickCapture={onLinkClick}
      className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white py-2 pl-2 pr-1 shadow-sm transition-colors hover:bg-zinc-50"
    >
      {content}
      <ExternalLink className="mr-4 size-4 shrink-0 text-zinc-400" />
    </a>
  );
}

export function CitationsDialog({ children, citations }: CitationsDialogProps) {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const { track } = useAnalytics();
  const openedAtRef = useRef<string | null>(null);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        openedAtRef.current = new Date().toISOString();
        track('protocol_reveal_citations_dialog_opened', {
          citation_count: citations.length,
        });
      } else {
        track('protocol_reveal_citations_dialog_closed', {
          citation_count: citations.length,
          opened_at: openedAtRef.current,
        });
        openedAtRef.current = null;
      }
      setOpen(newOpen);
    },
    [citations.length, track],
  );

  const content = (
    <div className="space-y-3 p-6 pt-0">
      {citations.map((c, index) => (
        <CitationCard
          key={index}
          citation={c}
          onLinkClick={() => {
            track('protocol_reveal_citation_link_clicked', {
              citation_title: c.title,
              citation_url:
                c.url || (c.doi ? `https://doi.org/${c.doi}` : undefined),
            });
          }}
        />
      ))}
    </div>
  );

  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-[85vh] flex-col gap-0 rounded-t-3xl p-0">
          <div className="flex items-center justify-between px-6 pb-4 pt-6">
            <div>
              <H3 className="text-lg">Citations</H3>
              <Body1 className="text-secondary">Supporting Studies</Body1>
            </div>
            <SheetClose asChild>
              <Button variant="ghost">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="flex-1 overflow-y-auto">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-y-auto rounded-3xl p-0">
        <div className="flex items-center justify-between px-8 pb-4 pr-2 pt-2">
          <div className="pt-4">
            <H3 className="text-xl">Citations</H3>
            <Body1 className="text-secondary">Supporting Studies</Body1>
          </div>
          <DialogClose asChild>
            <Button variant="ghost">
              <X className="size-4" />
            </Button>
          </DialogClose>
        </div>
        {content}
      </DialogContent>
    </Dialog>
  );
}
