import { ChevronRight, X } from 'lucide-react';
import { forwardRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Body1, Body2 } from '@/components/ui/typography';
import { BiomarkerDialog } from '@/features/data/components/dialogs/biomarker-dialog';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

import { useObservationBiomarkerIndex } from '../hooks/use-observation-biomarker-index';
import { useProductIndex } from '../hooks/use-product-index';
import type { CitationInfo } from '../types/message-parts';
import { getProductUrl } from '../utils/get-product-url';
import { parseFhirObservationCitation } from '../utils/parse-fhir-citation';
import {
  parseMarketplaceCitation,
  resolveMarketplaceProduct,
} from '../utils/parse-marketplace-citation';

interface CitationsDialogProps {
  messageId?: string;
  citations: CitationInfo[];
  trigger?: React.ReactNode;
}

export function CitationsDialog({ citations, trigger }: CitationsDialogProps) {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const observationIndex = useObservationBiomarkerIndex();
  const productIndex = useProductIndex();
  const items = citations.map((citation) => {
    const fhir = parseFhirObservationCitation(citation);
    if (fhir) {
      const b = observationIndex.get(fhir.observationId);
      return {
        citation,
        label: b?.name ?? fhir.biomarkerName ?? citation.source,
        biomarker: b,
      };
    }
    const mp = parseMarketplaceCitation(citation);
    if (mp) {
      const p = resolveMarketplaceProduct(mp, productIndex);
      if (p) {
        const url = getProductUrl(p);
        return { citation, label: p.name, href: url };
      }
    }
    return { citation, label: citation.source };
  });

  const content = (
    <div className="space-y-4 p-6 pt-0">
      <div className="space-y-3">
        {items.map(({ citation, label, href, biomarker }, index) => {
          const inner = (
            <div className="min-w-0 flex-1">
              <Body1>{citation.title}</Body1>
              <Body2 className="text-secondary">{label}</Body2>
            </div>
          );
          if (biomarker) {
            return (
              <BiomarkerDialog key={index} biomarker={biomarker}>
                <div className="group flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm hover:bg-zinc-50">
                  {inner}
                  <ChevronRight className="mr-1 size-4 text-secondary transition-all duration-200 ease-out group-hover:mr-0" />
                </div>
              </BiomarkerDialog>
            );
          }
          if (href) {
            return (
              <a
                key={index}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm hover:bg-zinc-50"
              >
                {inner}
                <ChevronRight className="mr-1 size-4 text-secondary transition-all duration-200 ease-out group-hover:mr-0" />
              </a>
            );
          }
          return (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          {trigger || <DefaultTrigger count={citations.length} />}
        </SheetTrigger>
        <SheetContent className="flex max-h-[85vh] flex-col gap-0 rounded-t-2xl p-0">
          <SheetHeader className="px-6 pb-4 pt-6">
            <SheetTitle className="flex items-center gap-2 text-lg">
              Sources
            </SheetTitle>
            <SheetClose className="absolute right-4 top-3">
              <Button variant="ghost">
                <X className="size-4" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <DefaultTrigger count={citations.length} />}
      </DialogTrigger>
      <DialogContent className="max-w-lg gap-0">
        <DialogHeader className="px-8 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2">Sources</DialogTitle>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-3">
          <Button variant="ghost">
            <X className="size-4" />
          </Button>
        </DialogClose>
        <div className="max-h-96 overflow-y-auto">{content}</div>
      </DialogContent>
    </Dialog>
  );
}

const DefaultTrigger = forwardRef<
  HTMLButtonElement,
  { count: number; className?: string }
>(({ count, className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="medium"
    className={cn('gap-2 text-muted-foreground', className)}
    {...props}
  >
    {count} Sources
  </Button>
));

DefaultTrigger.displayName = 'DefaultTrigger';
