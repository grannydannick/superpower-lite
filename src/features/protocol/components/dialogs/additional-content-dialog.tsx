import { X } from 'lucide-react';
import { ReactNode, useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { H3, H4 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import type { Product } from '@/types/api';

import type { ProtocolCitation } from '../../api';
import { ACTION_TYPE_FALLBACK_IMAGE } from '../../const/protocol-constants';
import { ProtocolMarkdown } from '../protocol-markdown';
import { SupplementPreview } from '../supplement-preview';

import { CitationCard } from './citations-dialog';

type AdditionalContentDialogProps = {
  children: ReactNode;
  actionTitle?: string;
  actionImage?: string;
  whyContent?: string | null;
  lookOutForContent?: string | null;
  additionalContent?: string | null;
  supplementProduct?: Product | null;
  citations?: ProtocolCitation[];
};

export function AdditionalContentDialog({
  children,
  actionTitle,
  actionImage,
  whyContent,
  lookOutForContent,
  additionalContent,
  supplementProduct,
  citations,
}: AdditionalContentDialogProps) {
  const [open, setOpen] = useState(false);
  const { track } = useAnalytics();
  const { width } = useWindowDimensions();
  const openedAtRef = useRef<string | null>(null);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        openedAtRef.current = new Date().toISOString();
        track('protocol_reveal_additional_content_dialog_opened', {
          action_title: actionTitle,
        });
      } else if (openedAtRef.current) {
        track('protocol_reveal_additional_content_dialog_closed', {
          action_title: actionTitle,
          opened_at: openedAtRef.current,
        });
        openedAtRef.current = null;
      }
      setOpen(newOpen);
    },
    [actionTitle, track],
  );

  const content = (
    <div className="flex flex-col gap-6 overflow-y-auto p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {actionImage ? (
          <div className="flex items-center gap-3">
            <img
              src={actionImage}
              alt={actionTitle}
              className="size-10 rounded-lg object-cover rounded-mask"
              onError={(e) => {
                e.currentTarget.src = ACTION_TYPE_FALLBACK_IMAGE;
              }}
            />
            <H3 className="text-xl">{actionTitle}</H3>
          </div>
        ) : (
          <H3 className="text-2xl">{actionTitle || 'More details'}</H3>
        )}
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-secondary"
          >
            <X className="size-4" />
          </Button>
        </DialogClose>
      </div>

      {/* Why we recommend this */}
      {whyContent && (
        <div className="space-y-2">
          <H4 className="text-base">Why we recommend this</H4>
          <ProtocolMarkdown
            content={whyContent}
            className="text-sm [&>div]:text-secondary"
          />
        </div>
      )}

      {/* What to look for */}
      {lookOutForContent && (
        <div className="space-y-2">
          <H4 className="text-base">What to look for</H4>
          <ProtocolMarkdown
            content={lookOutForContent}
            className="text-sm [&>div]:text-secondary"
          />
        </div>
      )}

      {/* Additional content / Member success */}
      {additionalContent && (
        <div className="space-y-2">
          <ProtocolMarkdown
            content={additionalContent}
            className="text-sm [&>div]:text-secondary"
          />
        </div>
      )}

      {/* Recommended product */}
      {supplementProduct && (
        <div className="space-y-2">
          <H4 className="text-base">Recommended product</H4>
          <SupplementPreview product={supplementProduct} />
        </div>
      )}

      {/* Citations */}
      {citations && citations.length > 0 && (
        <div className="space-y-3">
          <H4 className="text-base">Clinical Evidence</H4>
          {citations.map((citation, index) => (
            <CitationCard
              key={index}
              citation={citation}
              onLinkClick={() => {
                track('protocol_reveal_citation_link_clicked', {
                  citation_title: citation.title,
                  citation_url:
                    citation.url ||
                    (citation.doi
                      ? `https://doi.org/${citation.doi}`
                      : undefined),
                });
              }}
            />
          ))}
        </div>
      )}

      {/* AI suggestions */}
      <div className="space-y-3">
        <H4 className="text-base">Ask Superpower AI</H4>
        <AiSuggestions
          context={`I'm reviewing details${actionTitle ? ` for: ${actionTitle}` : ''}.${whyContent ? ` Why: ${whyContent.slice(0, 150)}` : ''}${additionalContent ? ` Details: ${additionalContent.slice(0, 150)}` : ''} Suggest helpful questions.`}
          limit={3}
          eventName="clicked_additional_content_ai_suggestion"
          showAskOwn
        />
      </div>
    </div>
  );

  if (width <= 1024) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex h-[calc(100vh-6rem)] flex-col rounded-t-3xl p-0 md:p-0">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-3xl p-0">
        {content}
      </DialogContent>
    </Dialog>
  );
}
