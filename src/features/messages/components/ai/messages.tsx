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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { PreviewMessage, ThinkingMessage } from './message';

const BOTTOM_AUTO_SCROLL_THRESHOLD_PX = 24;

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<UIMessage>['status'];
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  hasMoreOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void | Promise<void>;
  ctxMessageId?: string;
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  hasMoreOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
  ctxMessageId,
}: MessagesProps) {
  // Smart scroll state
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const autoScrollEnabledRef = useRef(true);
  const lastTouchYRef = useRef<number | null>(null);
  const prependAnchorRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);
  const loadOlderInFlightRef = useRef(false);

  const requestOlderMessages = useCallback(
    (options?: { disableAutoScroll?: boolean }) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      if (!hasMoreOlder || isLoadingOlder) return;
      if (loadOlderInFlightRef.current) return;
      if (!onLoadOlder) return;

      loadOlderInFlightRef.current = true;
      if (options?.disableAutoScroll === true) {
        autoScrollEnabledRef.current = false;
      }
      prependAnchorRef.current = {
        scrollHeight: container.scrollHeight,
        scrollTop: container.scrollTop,
      };

      void Promise.resolve(onLoadOlder())
        .catch((err) => {
          console.warn('Failed to load older messages', err);
        })
        .finally(() => {
          loadOlderInFlightRef.current = false;
        });
    },
    [hasMoreOlder, isLoadingOlder, onLoadOlder],
  );

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

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isAtBottom = distanceFromBottom <= BOTTOM_AUTO_SCROLL_THRESHOLD_PX;
    autoScrollEnabledRef.current = isAtBottom;

    const isNearTop = container.scrollTop <= 32;
    if (
      isNearTop &&
      hasMoreOlder &&
      !isLoadingOlder &&
      !loadOlderInFlightRef.current &&
      onLoadOlder
    ) {
      requestOlderMessages({ disableAutoScroll: true });
    }
  }, [hasMoreOlder, isLoadingOlder, onLoadOlder, requestOlderMessages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (messages.length === 0) return;
    if (!hasMoreOlder || isLoadingOlder) return;

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    if (maxScrollTop > 32) return;

    requestOlderMessages();
  }, [hasMoreOlder, isLoadingOlder, messages.length, requestOlderMessages]);

  useLayoutEffect(() => {
    const anchor = prependAnchorRef.current;
    const container = scrollContainerRef.current;
    if (!anchor || !container) return;

    const delta = container.scrollHeight - anchor.scrollHeight;
    container.scrollTop = anchor.scrollTop + delta;
    prependAnchorRef.current = null;
  }, [messages.length]);

  useEffect(() => {
    if (!isLoadingOlder && prependAnchorRef.current) {
      prependAnchorRef.current = null;
    }
  }, [isLoadingOlder]);

  // Auto-scroll when content changes
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !autoScrollEnabledRef.current) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, status]);

  // Scroll to a specific deep-linked message, loading older pages until it exists.
  const lastScrolledTargetRef = useRef<string | null>(null);
  useEffect(() => {
    if (ctxMessageId == null) {
      lastScrolledTargetRef.current = null;
      return;
    }

    if (messages.length === 0) return;

    const targetKey = `${chatId}:${ctxMessageId}`;
    if (lastScrolledTargetRef.current === targetKey) return;

    const el = document.getElementById(`message-${ctxMessageId}`);
    if (el == null) {
      if (!hasMoreOlder || isLoadingOlder || onLoadOlder == null) return;

      requestOlderMessages({ disableAutoScroll: true });
      return;
    }

    lastScrolledTargetRef.current = targetKey;
    autoScrollEnabledRef.current = false;

    // Defer to ensure layout is settled after framer-motion animations
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [
    chatId,
    ctxMessageId,
    hasMoreOlder,
    isLoadingOlder,
    messages.length,
    onLoadOlder,
    requestOlderMessages,
  ]);

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
        {isLoadingOlder && (
          <>
            <div className="mx-auto w-full max-w-3xl px-0.5">
              <div className="ml-auto max-w-2xl">
                <Skeleton variant="shimmer" className="ml-auto h-8 w-48" />
              </div>
            </div>
            <div className="mx-auto w-full max-w-3xl px-0.5">
              <div className="flex w-full gap-2">
                <Skeleton
                  variant="shimmer"
                  className="mt-1 size-6 shrink-0 rounded-full"
                />
                <div className="flex flex-col gap-1.5">
                  <Skeleton variant="shimmer" className="h-6 w-64" />
                  <Skeleton variant="shimmer" className="h-6 w-80" />
                  <Skeleton variant="shimmer" className="h-6 w-52" />
                </div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-3xl px-0.5">
              <div className="ml-auto max-w-2xl">
                <Skeleton variant="shimmer" className="ml-auto h-8 w-48" />
              </div>
            </div>
            <div className="mx-auto w-full max-w-3xl px-0.5">
              <div className="flex w-full gap-2">
                <Skeleton
                  variant="shimmer"
                  className="mt-1 size-6 shrink-0 rounded-full"
                />
                <div className="flex flex-col gap-1.5">
                  <Skeleton variant="shimmer" className="h-6 w-64" />
                  <Skeleton variant="shimmer" className="h-6 w-80" />
                  <Skeleton variant="shimmer" className="h-6 w-52" />
                </div>
              </div>
            </div>
          </>
        )}

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

        <div className="min-h-[24px] min-w-[24px] shrink-0" />
      </div>

      <ScrollDownButton
        messagesLength={messages.length}
        scrollContainerRef={scrollContainerRef}
        onScrollToBottom={() => {
          autoScrollEnabledRef.current = true;
        }}
      />
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
