import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { ArrowDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useHistory } from '../../api/get-history';

import { PreviewMessage, ThinkingMessage } from './message';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<UIMessage>['status'];
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  disableAutoNavigate?: boolean;
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  disableAutoNavigate = false,
}: MessagesProps) {
  const { data: history } = useHistory();
  const navigate = useNavigate();
  const { id } = useParams();

  // Smart scroll state
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const autoScrollEnabledRef = useRef(true);
  const lastTouchYRef = useRef<number | null>(null);

  // If the chat is ready and there are messages, navigate to the chat
  useEffect(() => {
    if (disableAutoNavigate) return;
    if (status === 'ready' && messages.length > 0 && !id) {
      const recentChat = history?.find((h) => h.id === chatId);
      if (recentChat) {
        navigate(`/concierge/${recentChat.id}`, { replace: true });
      }
    }
  }, [status, messages, history, chatId, navigate, id, disableAutoNavigate]);

  // Wheel event: detect desktop scroll-up gesture
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      // deltaY < 0 means user scrolled UP
      autoScrollEnabledRef.current = false;
    }
  }, []);

  // Touch events: detect mobile scroll-up gesture
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      lastTouchYRef.current = touch.clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch && lastTouchYRef.current !== null) {
      const deltaY = touch.clientY - lastTouchYRef.current;
      if (deltaY > 10) {
        // Finger moved DOWN = content scrolling UP = user wants to see previous content
        autoScrollEnabledRef.current = false;
      }
      lastTouchYRef.current = touch.clientY;
    }
  }, []);

  // Scroll event: re-enable auto-scroll when user reaches bottom
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      24;
    if (isAtBottom) {
      autoScrollEnabledRef.current = true;
    }
  }, []);

  // Auto-scroll when content changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !autoScrollEnabledRef.current) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, status]);

  return (
    <div
      className={cn(
        'relative max-h-full overflow-hidden',
        messages.length === 0 && 'block h-0',
      )}
    >
      <div
        ref={scrollContainerRef}
        id="ai-chat-scroll-container"
        className="relative flex max-h-[calc(100vh-20.5rem)] min-h-32 min-w-0 flex-col gap-6 overflow-y-scroll py-4 md:max-h-full lg:pb-0"
        style={{
          willChange: 'scroll-position',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 32px, rgba(0,0,0,1) calc(100% - 32px), rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 32px, rgba(0,0,0,1) calc(100% - 32px), rgba(0,0,0,0) 100%)',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <div key={message.id}>
            <PreviewMessage
              chatId={chatId}
              message={message}
              isLoading={
                status === 'streaming' && messages.length - 1 === index
              }
              setMessages={setMessages}
            />
          </div>
        ))}

        {status === 'submitted' &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && (
            <div className="pl-0.5">
              <ThinkingMessage />
            </div>
          )}

        <ScrollDownButton
          messagesLength={messages.length}
          scrollContainerRef={scrollContainerRef}
          onScrollToBottom={() => {
            autoScrollEnabledRef.current = true;
          }}
        />

        <div className="min-h-[24px] min-w-[24px] shrink-0" />
      </div>
    </div>
  );
}

export const Messages = PureMessages;

function ScrollDownButton({
  messagesLength,
  scrollContainerRef,
  onScrollToBottom,
}: {
  messagesLength: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onScrollToBottom: () => void;
}) {
  const [show, setShow] = useState(false);

  // Effect checking if the user scrolled to bottom or not
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const threshold = 24; // px tolerance from bottom
    const update = () => {
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
      setShow(!atBottom);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    return () => {
      el.removeEventListener('scroll', update);
    };
  }, [messagesLength, scrollContainerRef]);

  const handleClick = () => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      onScrollToBottom();
    }
  };

  return (
    <div
      className={cn(
        'sticky bottom-5 z-30 mx-auto transition-all duration-300 ease-out pr-2',
        !show && 'opacity-0 bottom-0 blur-[1px]',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'rounded-full border bg-white mx-auto p-2 text-zinc-500 shadow-sm hover:bg-zinc-50 hover:text-black active:scale-[.98]',
          show ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        onClick={handleClick}
      >
        <ArrowDown size={16} />
      </Button>
    </div>
  );
}
