import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { ArrowDown } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { PreviewMessage, ThinkingMessage } from '../ai/message';

const BOTTOM_AUTO_SCROLL_THRESHOLD_PX = 24;

interface AssistantMessagesProps {
  status: UseChatHelpers<UIMessage>['status'];
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  disableLayoutAnimation?: boolean;
}

export function AssistantMessages({
  status,
  messages,
  setMessages,
  disableLayoutAnimation = false,
}: AssistantMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollEnabledRef = useRef(true);
  const lastTouchYRef = useRef<number | null>(null);

  // Bypass react-remove-scroll's wheel block when a Radix Dialog is open.
  // react-remove-scroll attaches a capture-phase listener on `document` that
  // calls preventDefault()+stopPropagation() for scroll events outside the
  // dialog portal. Because `window` fires before `document` in the capture
  // phase, we can intercept the event first and stop it from reaching the
  // scroll-lock handler, letting the browser scroll this container normally.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.contains(e.target as Node)) {
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener('wheel', onWheel, { capture: true });
    return () =>
      window.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  // Wheel event: detect desktop scroll-up gesture
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.deltaY < 0) {
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
        autoScrollEnabledRef.current = false;
      }
      lastTouchYRef.current = touch.clientY;
    }
  }, []);

  // Scroll event: re-enable auto-scroll when user reaches bottom
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isAtBottom = distanceFromBottom <= BOTTOM_AUTO_SCROLL_THRESHOLD_PX;
    autoScrollEnabledRef.current = isAtBottom;
  }, []);

  // Auto-scroll when content changes
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || !autoScrollEnabledRef.current) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, status]);

  return (
    <div className={cn('relative flex min-h-0 flex-1')}>
      <div
        ref={scrollRef}
        className={cn(
          'relative flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-auto overflow-x-auto overscroll-contain py-4',
          'scrollbar scrollbar-thumb-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2',
        )}
        style={{
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
          <div
            key={message.id}
            className={cn(
              'ease-in-out',
              disableLayoutAnimation ? '' : 'transition-all duration-200',
            )}
          >
            <PreviewMessage
              message={message}
              isLoading={
                status === 'streaming' && messages.length - 1 === index
              }
              setMessages={setMessages}
              disableLayoutAnimation={disableLayoutAnimation}
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
      </div>

      <ScrollDownButton
        messagesLength={messages.length}
        scrollContainerRef={scrollRef}
        onScrollToBottom={() => {
          autoScrollEnabledRef.current = true;
        }}
      />
    </div>
  );
}

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

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const update = () => {
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <=
        BOTTOM_AUTO_SCROLL_THRESHOLD_PX;
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
        'absolute inset-x-0 bottom-5 z-30 flex justify-center transition-all duration-300 ease-out',
        !show && 'bottom-0 opacity-0 blur-[1px]',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'rounded-full border bg-white p-2 text-zinc-500 shadow-sm hover:bg-zinc-50 hover:text-black active:scale-[.98]',
          show ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        onClick={handleClick}
      >
        <ArrowDown size={16} />
      </Button>
    </div>
  );
}
