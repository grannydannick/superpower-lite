import { useWindowWidth } from '@wojtekmaj/react-hooks';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { H3 } from '@/components/ui/typography';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useSuggestions } from '@/features/messages/hooks/use-suggestions';
import { useAssistantStore } from '@/features/messages/stores/assistant-store';
import { useAnalytics } from '@/hooks/use-analytics';

export const BiomarkerAiSuggestions = ({ name }: { name: string }) => {
  const { track } = useAnalytics();
  const width = useWindowWidth();
  const navigate = useNavigate();
  const { suggestions, isLoading } = useSuggestions({
    enabled: true,
    max: 3,
    context: `I'm currently looking at my ${name} biomarker. Please give me some suggestions for questions.`,
  });
  const open = useAssistantStore((s) => s.open);

  const isMobile = width ? width < 1024 : false;

  const content = (() => {
    if (isLoading || suggestions.length === 0) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Skeleton
          key={index}
          variant="shimmer"
          className="h-16 w-full shrink-0 rounded-2xl"
        />
      ));
    }

    return suggestions.map((suggestion, index) => (
      <Button
        variant="outline"
        key={index}
        className="group w-full justify-start gap-5 rounded-2xl text-left transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        onClick={() => {
          if (isMobile) {
            navigate(
              `/concierge?defaultMessage=${encodeURIComponent(suggestion)}`,
            );
          } else {
            open(suggestion);
          }

          track('clicked_biomarker_ai_suggestion', {
            name,
            suggestion,
          });
        }}
      >
        <AnimatedIcon state="idle" className="size-5 shrink-0" />
        <span className="w-full min-w-0 flex-1 self-start whitespace-normal break-words text-left text-sm lg:text-base">
          {suggestion}
        </span>
        <ArrowRight className="size-4 shrink-0 text-zinc-500 transition-all duration-200 ease-out group-hover:translate-x-1 group-hover:text-zinc-600" />
      </Button>
    ));
  })();

  return (
    <div className="pb-8">
      <H3 className="mb-3">Ask Superpower AI</H3>
      <div className="space-y-2">{content}</div>
    </div>
  );
};
