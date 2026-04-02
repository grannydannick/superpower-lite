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
import { Body2, H3, H4 } from '@/components/ui/typography';
import { AiSuggestions } from '@/features/messages/components/ai-suggestions';
import { useAnalytics } from '@/hooks/use-analytics';
import { useGender } from '@/hooks/use-gender';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

import { ProtocolMarkdown } from '../protocol-markdown';

type WhyItMattersDialogProps = {
  children: ReactNode;
  goalTitle?: string;
  impactContent?: string;
};

export function WhyItMattersDialog({
  children,
  goalTitle,
  impactContent,
}: WhyItMattersDialogProps) {
  const [open, setOpen] = useState(false);
  const { track } = useAnalytics();
  const { gender } = useGender();
  const openedAtRef = useRef<string | null>(null);
  const { width } = useWindowDimensions();

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        openedAtRef.current = new Date().toISOString();
        track('protocol_reveal_why_it_matters_dialog_opened', {
          goal_title: goalTitle,
        });
      } else if (openedAtRef.current) {
        track('protocol_reveal_why_it_matters_dialog_closed', {
          goal_title: goalTitle,
          opened_at: openedAtRef.current,
        });
        openedAtRef.current = null;
      }
      setOpen(newOpen);
    },
    [goalTitle, track],
  );

  const content = (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <H3 className="text-2xl">Why this matters</H3>
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

      <img
        src={`/protocol/twins/${gender === 'female' ? 'female' : 'male'}-twin-purple.png`}
        alt="Impact visualization"
        className="mx-auto w-full max-w-xs object-contain"
        style={{
          maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 75%, transparent 100%)',
        }}
      />

      <div className="space-y-4">
        {impactContent ? (
          <ProtocolMarkdown
            content={impactContent}
            className="[&>div]:text-secondary"
          />
        ) : (
          <>
            <div className="space-y-2">
              <H4>Where this might be coming from:</H4>
              <Body2 className="text-secondary">
                Your blood results show markers that indicate this area needs
                attention.
              </Body2>
            </div>
            <div className="space-y-2">
              <H4>How long does it take to address this:</H4>
              <Body2 className="text-secondary">
                With consistent effort, you may see improvements within several
                weeks to months.
              </Body2>
            </div>
            <div className="space-y-2">
              <H4>What happens if you don&apos;t address this:</H4>
              <Body2 className="text-secondary">
                Left unaddressed, these markers may continue to impact your
                overall health.
              </Body2>
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        <H4>Ask Superpower AI</H4>
        <AiSuggestions
          context={`I'm reviewing why this goal matters${goalTitle ? ` for: ${goalTitle}` : ''}.${impactContent ? ` Key info: ${impactContent.slice(0, 200)}...` : ''} Suggest helpful questions.`}
          limit={3}
          eventName="clicked_why_it_matters_ai_suggestion"
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
