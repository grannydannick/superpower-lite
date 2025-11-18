import { Clock } from 'lucide-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Body1, Body2 } from '@/components/ui/typography';
import { InfoDialog } from '@/features/messages/components/info-dialog';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn } from '@/lib/utils';

import { AnimatedIcon } from './ai/animated-icon';

const AICard = () => {
  const type = useChatStore((s) => s.type);
  const resetSession = useChatStore((s) => s.resetSession);
  const { track } = useAnalytics();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div
      className={cn(
        'flex gap-6 w-full cursor-pointer flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition-all duration-150' +
          '',
        type === 'ai'
          ? 'border-vermillion-900 shadow-lg shadow-vermillion-900/15'
          : 'border-zinc-100 hover:border-zinc-200',
      )}
      onClick={() => {
        const next = new URLSearchParams(searchParams);
        next.set('type', 'ai');
        setSearchParams(next, { replace: true });
        // Reset session data for new chat session
        resetSession();
        // Track AI chat session start
        track('started_chat_session_ai');
      }}
      role="presentation"
    >
      <div className="flex items-center justify-between">
        <AnimatedIcon state="idle" size={32} />
        <div className="flex items-center gap-2">
          <Clock className="mb-0.5 text-zinc-400" size={14} />
          <Body2 className="line-clamp-1 text-zinc-400">Immediate</Body2>
        </div>
      </div>
      <div>
        <Body1>Ask your Superpower AI</Body1>
        <Body2 className="text-zinc-400">
          Simple questions, advice and analysis
        </Body2>
      </div>
    </div>
  );
};

const CareTeamCard = () => {
  const type = useChatStore((s) => s.type);
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div
      className={cn(
        'flex gap-6 w-full cursor-pointer flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition-all duration-150' +
          '',
        type === 'concierge'
          ? 'border-vermillion-900 shadow-lg shadow-vermillion-900/15'
          : 'border-zinc-100 hover:border-zinc-200',
      )}
      onClick={() => {
        const next = new URLSearchParams(searchParams);
        next.set('type', 'concierge');
        setSearchParams(next, { replace: true });
      }}
      role="presentation"
    >
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          <img
            className="size-8 min-w-8 rounded-full border-2 border-white object-cover"
            src="/services/doctors/doc_1.webp"
            alt="Superpower Concierge Doctor 1"
          />
          <img
            className="size-8 min-w-8 rounded-full border-2 border-white object-cover"
            src="/services/doctors/doc_2.webp"
            alt="Superpower Concierge Doctor 2"
          />
          <img
            className="size-8 min-w-8 rounded-full border-2 border-white object-cover"
            src="/services/doctors/doc_3.webp"
            alt="Superpower Concierge Doctor 3"
          />
        </div>
        <div className="flex items-center gap-2">
          <Clock className="mb-0.5 text-zinc-400" size={16} />
          <Body2 className="line-clamp-1 text-zinc-400">{`<24h on weekdays`}</Body2>
        </div>
      </div>
      <div>
        <Body1>Ask your care team</Body1>
        <Body2 className="text-zinc-400">
          Complex topics and customer service
        </Body2>
      </div>
    </div>
  );
};

export const ChatOptions = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const updateType = useChatStore((s) => s.update);

  // Update the chat type if the URL has a type parameter
  useEffect(() => {
    if (type && (type === 'ai' || type === 'concierge')) {
      updateType(type as 'ai' | 'concierge');
    }
  }, [type, updateType]);

  return (
    <div className="flex h-full flex-col items-center gap-4 md:flex-row">
      <AICard />
      <CareTeamCard />
      <InfoDialog />
    </div>
  );
};
