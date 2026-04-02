import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useWindowWidth } from '@wojtekmaj/react-hooks';
import { ArrowRight } from 'lucide-react';
import { Suspense, lazy, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateFollowups } from '@/features/messages/api/create-followups';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';

const AssistantChatSheet = lazy(() =>
  import('@/features/messages/components/assistant/assistant-chat-sheet').then(
    (m) => ({ default: m.AssistantChatSheet }),
  ),
);
import { useAnalytics } from '@/hooks/use-analytics';

export const AiSuggestions = ({
  context,
  onClick,
  limit = 3,
  prefix,
  eventName,
  showAskOwn = false,
}: {
  context: string;
  onClick?: (suggestion: string) => void;
  limit?: number;
  prefix?: string;
  eventName?: string;
  showAskOwn?: boolean;
}) => {
  const { track } = useAnalytics();

  const width = useWindowWidth();
  const navigate = useNavigate();

  const { data: items = [], isFetching } = useCreateFollowups({
    context,
    count: limit,
    enabled: true,
  });

  const open = useAssistantStore((s) => s.open);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRevealMode = pathname.startsWith('/protocol/reveal/');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMessage, setSheetMessage] = useState('');

  const isMobile = width ? width < 1024 : false;

  const suggestions = items.slice(0, limit);
  const isLoading = isFetching;

  const skeletonKeys = [
    's1',
    's2',
    's3',
    's4',
    's5',
    's6',
    's7',
    's8',
    's9',
    's10',
    's11',
    's12',
  ];

  const skeletons: React.ReactElement[] = [];
  for (const key of skeletonKeys) {
    if (skeletons.length >= limit) break;
    skeletons.push(
      <Skeleton
        key={key}
        variant="shimmer"
        className="h-14 w-full shrink-0 rounded-2xl"
      />,
    );
  }

  const suggestionButtons = suggestions.map((suggestion) => {
    const suggestionText = prefix ? `${prefix} ${suggestion}` : suggestion;

    const handleClick = () => {
      if (isMobile) {
        if (isRevealMode) {
          setSheetMessage(suggestionText);
          setSheetOpen(true);
        } else {
          const href = `/concierge?defaultMessage=${encodeURIComponent(
            suggestionText,
          )}`;
          void navigate({ href });
        }
      } else {
        open(suggestionText);
      }

      if (onClick) {
        onClick(suggestionText);
      }

      track(eventName ?? 'clicked_ai_suggestion', {
        context,
        suggestion: suggestionText,
      });
    };

    return (
      <Button
        variant="outline"
        key={suggestionText}
        className="group w-full justify-start gap-5 rounded-2xl pl-3.5 text-left transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        onClick={handleClick}
      >
        <AnimatedIcon state="idle" className="size-5 shrink-0" />
        <span className="w-full min-w-0 flex-1 self-start whitespace-normal break-words text-left text-sm lg:text-base">
          {suggestionText}
        </span>
        <ArrowRight className="size-4 shrink-0 text-zinc-500 transition-all duration-200 ease-out group-hover:translate-x-1 group-hover:text-zinc-600" />
      </Button>
    );
  });

  const content = isLoading ? skeletons : suggestionButtons;

  if (!content || (suggestions.length === 0 && !isLoading && !showAskOwn))
    return null;

  const handleAskOwn = () => {
    if (isMobile) {
      if (isRevealMode) {
        setSheetMessage('');
        setSheetOpen(true);
      } else {
        void navigate({ href: '/concierge' });
      }
    } else {
      open('', { autoSend: false });
    }

    track(eventName ?? 'clicked_ai_suggestion_ask_own', {
      context,
    });
  };

  return (
    <>
      <div className="space-y-2">
        {content}
        {showAskOwn && !isLoading && (
          <Button
            variant="outline"
            onClick={handleAskOwn}
            className="group w-full justify-start gap-5 rounded-2xl pl-3.5 text-left text-secondary transition-all duration-200"
          >
            <AnimatedIcon state="idle" className="size-5 shrink-0" />
            <span className="w-full min-w-0 flex-1 self-start whitespace-normal break-words text-left text-sm lg:text-base">
              Ask your own question...
            </span>
            <ArrowRight className="size-4 shrink-0 text-secondary transition-all duration-200 ease-out group-hover:translate-x-1" />
          </Button>
        )}
      </div>
      <Suspense fallback={null}>
        <AssistantChatSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          defaultMessage={sheetMessage}
        />
      </Suspense>
    </>
  );
};
