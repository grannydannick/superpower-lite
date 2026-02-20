import { useWindowWidth } from '@wojtekmaj/react-hooks';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateFollowups } from '@/features/messages/api/create-followups';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';
import { useAnalytics } from '@/hooks/use-analytics';

export const AiSuggestions = ({
  context,
  onClick,
  limit = 3,
  prefix,
  eventName,
}: {
  context: string;
  onClick?: (suggestion: string) => void;
  limit?: number;
  prefix?: string;
  eventName?: string;
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

  const isMobile = width ? width < 1024 : false;

  const suggestions = items.slice(0, limit);
  const isLoading = isFetching;

  const skeletons = Array.from({ length: limit }).map((_, index) => (
    <Skeleton
      key={index}
      variant="shimmer"
      className="h-14 w-full shrink-0 rounded-2xl"
    />
  ));

  const suggestionButtons = suggestions.map((suggestion, index) => {
    const suggestionText = prefix ? `${prefix} ${suggestion}` : suggestion;

    const handleClick = () => {
      if (isMobile) {
        navigate(
          `/concierge?defaultMessage=${encodeURIComponent(suggestionText)}`,
        );
      } else {
        open(suggestionText);
      }

      onClick && onClick(suggestionText);

      track(eventName ?? 'clicked_ai_suggestion', {
        context,
        suggestion: suggestionText,
      });
    };

    return (
      <Button
        variant="outline"
        key={index}
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

  if (!content || (suggestions.length === 0 && !isLoading)) return null;

  return <div className="space-y-2">{content}</div>;
};
