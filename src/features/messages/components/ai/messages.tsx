import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import {
  AnimatePresence,
  animate,
  m,
  useMotionValueEvent,
} from 'framer-motion';
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
import {
  useChatScroll,
  CHAT_NEAR_BOTTOM_THRESHOLD_PX,
} from '@/features/messages/hooks/use-chat-scroll';
import { CHAT_SCROLL_CONTAINER_ID } from '@/features/messages/utils/chat-scroll';
import { cn } from '@/lib/utils';

import { PreviewMessage, ThinkingMessage } from './message';
import { EarlierMessagesHint } from './welcome/content';

interface MessagesProps {
  status: UseChatHelpers<UIMessage>['status'];
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  hasMoreOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void | Promise<void>;
  hasMoreNewer?: boolean;
  isLoadingNewer?: boolean;
  onLoadNewer?: () => void | Promise<void>;
  onJumpToLatest?: () => Promise<void>;
  welcomeContent?: React.ReactNode;
  hasInteracted?: boolean;
  didJump?: boolean;
  isSearchOpen?: boolean;
}

function PureMessages({
  status,
  messages,
  setMessages,
  hasMoreOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
  hasMoreNewer = false,
  isLoadingNewer = false,
  onLoadNewer,
  onJumpToLatest,
  welcomeContent,
  hasInteracted = false,
  didJump = false,
  isSearchOpen = false,
}: MessagesProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const autoScrollEnabledRef = useRef(true);
  const lastTouchYRef = useRef<number | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const prependAnchorRef = useRef<{
    scrollHeight: number;
    scrollTop: number;
  } | null>(null);
  const loadOlderInFlightRef = useRef(false);
  const loadNewerInFlightRef = useRef(false);
  const didMountRef = useRef(false);
  const prevScrollTopRef = useRef(0);
  const autoScrollAnimRef = useRef<ReturnType<typeof animate> | null>(null);
  const suppressAutoScroll = didJump || isSearchOpen;
  const suppressAutoScrollRef = useRef(suppressAutoScroll);
  suppressAutoScrollRef.current = suppressAutoScroll;
  const shouldShowWelcomeContent =
    !didJump && !hasInteracted && welcomeContent != null;

  const { distanceFromBottom } = useChatScroll({
    containerRef: scrollContainerRef,
  });

  const syncScrollDownButton = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container == null) {
      return;
    }

    // While we're following the latest messages, keep the button hidden.
    // The last message's `snap-end` + `scroll-mb-12` can leave the end ref a
    // few pixels below the container after an auto-scroll, and content growth
    // briefly pushes it further before the layout effect catches up — both
    // would otherwise flash the button during streaming.
    if (autoScrollEnabledRef.current) {
      setShowScrollToBottom(false);
      return;
    }

    const endEl = messagesEndRef.current;
    if (endEl == null) {
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollToBottom(distance > CHAT_NEAR_BOTTOM_THRESHOLD_PX);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    setShowScrollToBottom(
      endRect.bottom > containerRect.bottom + CHAT_NEAR_BOTTOM_THRESHOLD_PX,
    );
  }, []);

  useMotionValueEvent(distanceFromBottom, 'change', (distance) => {
    if (!didMountRef.current) {
      return;
    }

    // Distinguish user-initiated scroll-up from content growth: content
    // growth leaves scrollTop unchanged but increases distance, while a
    // user scroll-up decreases scrollTop. Only the latter should disable
    // auto-scroll; otherwise streaming tokens would turn it off mid-reply.
    const container = scrollContainerRef.current;
    const currentScrollTop = container?.scrollTop ?? 0;
    const scrolledUp = currentScrollTop < prevScrollTopRef.current;
    prevScrollTopRef.current = currentScrollTop;

    if (suppressAutoScrollRef.current) {
      syncScrollDownButton();
      return;
    }
    if (distance <= CHAT_NEAR_BOTTOM_THRESHOLD_PX) {
      autoScrollEnabledRef.current = true;
    } else if (scrolledUp) {
      autoScrollEnabledRef.current = false;
    }
    syncScrollDownButton();
  });

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

  const requestNewerMessages = useCallback(() => {
    if (!hasMoreNewer || isLoadingNewer) return;
    if (loadNewerInFlightRef.current) return;
    if (!onLoadNewer) return;

    loadNewerInFlightRef.current = true;
    autoScrollEnabledRef.current = false;

    void Promise.resolve(onLoadNewer())
      .catch((err) => {
        console.warn('Failed to load newer messages', err);
      })
      .finally(() => {
        loadNewerInFlightRef.current = false;
      });
  }, [hasMoreNewer, isLoadingNewer, onLoadNewer]);
  // Wheel event: detect desktop scroll-up gesture
  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.deltaY < 0) {
      // deltaY < 0 means user scrolled UP
      autoScrollEnabledRef.current = false;
      autoScrollAnimRef.current?.stop();
      autoScrollAnimRef.current = null;
    }
  }, []);

  // Touch events: detect mobile scroll-up gesture
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (touch) {
      lastTouchYRef.current = touch.clientY;
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (touch == null || lastTouchYRef.current == null) {
      return;
    }

    const deltaY = touch.clientY - lastTouchYRef.current;
    if (deltaY > 10) {
      // Finger moved DOWN = content scrolling UP = user wants to see previous content
      autoScrollEnabledRef.current = false;
      autoScrollAnimRef.current?.stop();
      autoScrollAnimRef.current = null;
    }
    lastTouchYRef.current = touch.clientY;
  }, []);

  const handleScrollDownClick = useCallback(() => {
    autoScrollEnabledRef.current = true;
    if (hasMoreNewer && onJumpToLatest) {
      void onJumpToLatest();
      return;
    }
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [hasMoreNewer, onJumpToLatest]);

  const prevSuppressAutoScrollRef = useRef(suppressAutoScroll);
  const prevScrollHeightRef = useRef(0);
  // Single post-render scroll sync:
  // - restore position after prepends
  // - react to suppression toggles
  // - auto-scroll when following the latest messages
  // - refresh the down-arrow visibility when layout changes without scroll
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container == null) {
      return;
    }

    const prevScrollHeight = prevScrollHeightRef.current;
    const scrollHeightGrew = container.scrollHeight > prevScrollHeight;
    prevScrollHeightRef.current = container.scrollHeight;

    const anchor = prependAnchorRef.current;
    const hadPrependAnchor = anchor != null;
    if (anchor != null) {
      const delta = container.scrollHeight - anchor.scrollHeight;
      container.scrollTop = anchor.scrollTop + delta;
      if (delta !== 0 || !isLoadingOlder) {
        prependAnchorRef.current = null;
      }
    }

    const firstMount = !didMountRef.current;
    if (firstMount) {
      didMountRef.current = true;
      if (suppressAutoScroll) {
        autoScrollEnabledRef.current = false;
      }
    } else if (prevSuppressAutoScrollRef.current !== suppressAutoScroll) {
      if (suppressAutoScroll) {
        autoScrollEnabledRef.current = false;
      } else {
        autoScrollEnabledRef.current =
          distanceFromBottom.get() <= CHAT_NEAR_BOTTOM_THRESHOLD_PX;
      }
    }
    prevSuppressAutoScrollRef.current = suppressAutoScroll;

    // Only jump to bottom when content actually grew (new tokens/messages) or
    // on first mount. Re-renders from unrelated state changes (e.g. the
    // scroll-down button toggling) must not interrupt an in-flight smooth
    // scroll triggered by `scrollIntoView`.
    const willAutoScroll =
      !hadPrependAnchor &&
      autoScrollEnabledRef.current &&
      (scrollHeightGrew || firstMount);

    if (willAutoScroll) {
      const target = container.scrollHeight - container.clientHeight;
      autoScrollAnimRef.current?.stop();
      if (firstMount) {
        container.scrollTop = target;
        autoScrollAnimRef.current = null;
      } else {
        autoScrollAnimRef.current = animate(container.scrollTop, target, {
          duration: 0.15,
          ease: 'easeOut',
          onUpdate: (v) => {
            container.scrollTop = v;
          },
          onComplete: () => {
            autoScrollAnimRef.current = null;
          },
        });
      }
    }

    syncScrollDownButton();
  });

  useEffect(() => {
    return () => {
      autoScrollAnimRef.current?.stop();
    };
  }, []);

  // Infinite-scroll pagination via IntersectionObserver sentinels. Re-observe
  // on messages.length change so that if a sentinel is still intersecting
  // after a page lands (stuck-at-edge / content-shorter-than-viewport), the
  // observer fires its initial callback again and chains the next page.
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const root = scrollContainerRef.current;
    if (sentinel == null || root == null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestOlderMessages({ disableAutoScroll: true });
        }
      },
      { root, rootMargin: '200px 0px 0px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [requestOlderMessages, messages.length]);

  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    const root = scrollContainerRef.current;
    if (sentinel == null || root == null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestNewerMessages();
        }
      },
      { root, rootMargin: '0px 0px 200px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [requestNewerMessages, messages.length]);

  let lastRealMessageId: string | null = null;
  if (shouldShowWelcomeContent) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const id = messages[i].id;
      if (id.startsWith('preset-')) {
        continue;
      }
      lastRealMessageId = id;
      break;
    }
  }

  // Re-pin to the bottom when the welcome panel grows after first paint
  // (e.g. dune gradient + setup-action images finishing loading on slow
  // connections). Without this, the tail of the welcome — including the
  // suggested actions — ends up below the viewport. Uses a callback ref so
  // setup/teardown is tied to the welcome element's mount lifecycle.
  const welcomeResizeRef = useCallback((el: HTMLDivElement | null) => {
    if (el == null) {
      return;
    }
    const observer = new ResizeObserver(() => {
      const container = scrollContainerRef.current;
      if (container == null) {
        return;
      }
      if (suppressAutoScrollRef.current) {
        return;
      }
      if (!autoScrollEnabledRef.current) {
        return;
      }
      autoScrollAnimRef.current?.stop();
      autoScrollAnimRef.current = null;
      container.scrollTop = container.scrollHeight;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleEarlierMessagesClick = useCallback(() => {
    if (lastRealMessageId == null) {
      return;
    }
    const el = document.getElementById(`message-${lastRealMessageId}`);
    if (el == null) {
      return;
    }
    autoScrollEnabledRef.current = false;
    autoScrollAnimRef.current?.stop();
    autoScrollAnimRef.current = null;
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [lastRealMessageId]);

  // When jumping, unmount entirely so scrollHeight settles immediately —
  // an AnimatePresence exit would keep the full-height element in the DOM
  // and shift the scroll target.
  //
  // On exit we animate `height` alongside `minHeight` so the element truly
  // collapses to 0 before it unmounts. `min-height: 0` alone isn't enough:
  // it only removes the floor, leaving the element at its intrinsic content
  // height until it unmounts — which would snap the scroll position once
  // the exit finishes.
  let welcomeSection: React.ReactNode = null;
  if (welcomeContent != null && !didJump) {
    welcomeSection = (
      <AnimatePresence>
        {shouldShowWelcomeContent && (
          <m.div
            key="welcome"
            ref={welcomeResizeRef}
            initial={false}
            animate={{
              height: 'auto',
              minHeight: '100%',
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              height: 0,
              minHeight: 0,
              opacity: 0,
              y: 24,
              scale: 0.97,
              filter: 'blur(4px)',
            }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{ overflow: 'hidden' }}
            className={cn(
              'flex w-full flex-col items-center',
              lastRealMessageId != null && 'pt-24 md:pt-0',
            )}
          >
            <div className="my-auto w-full">{welcomeContent}</div>
          </m.div>
        )}
      </AnimatePresence>
    );
  }
  // Scroll to a specific deep-linked message, loading older pages until it exists.
  const lastScrolledTargetRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastRealMessageId == null) {
      lastScrolledTargetRef.current = null;
      return;
    }

    if (messages.length === 0) {
      return;
    }

    if (lastScrolledTargetRef.current === lastRealMessageId) {
      return;
    }

    const el = document.getElementById(`message-${lastRealMessageId}`);
    if (el == null) {
      if (!hasMoreOlder || isLoadingOlder || onLoadOlder == null) {
        return;
      }

      requestOlderMessages({ disableAutoScroll: true });
      return;
    }

    lastScrolledTargetRef.current = lastRealMessageId;
    autoScrollEnabledRef.current = false;

    // Defer to ensure layout is settled after framer-motion animations
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }, [
    lastRealMessageId,
    hasMoreOlder,
    isLoadingOlder,
    messages.length,
    onLoadOlder,
    requestOlderMessages,
  ]);

  return (
    <div
      className={cn(
        'relative flex min-h-0 flex-1 flex-col',
        messages.length === 0 && !shouldShowWelcomeContent && 'hidden',
      )}
    >
      {shouldShowWelcomeContent && lastRealMessageId != null && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pb-4 pt-10">
          <div className="pointer-events-auto">
            <EarlierMessagesHint
              distanceFromBottom={distanceFromBottom}
              onClick={handleEarlierMessagesClick}
            />
          </div>
        </div>
      )}
      <div
        ref={scrollContainerRef}
        id={CHAT_SCROLL_CONTAINER_ID}
        className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-4 lg:pb-0"
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
      >
        <div
          ref={topSentinelRef}
          aria-hidden
          className="h-px w-full shrink-0"
        />
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

        {messages.map((message, index) => {
          const isLast = index === messages.length - 1;
          return (
            <div key={message.id}>
              <PreviewMessage
                message={message}
                isLoading={status === 'streaming' && isLast}
                setMessages={setMessages}
              />
            </div>
          );
        })}

        {status === 'submitted' &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && (
            <div className="pl-0.5">
              <ThinkingMessage />
            </div>
          )}

        {isLoadingNewer && (
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
        )}

        <div
          ref={bottomSentinelRef}
          aria-hidden
          className="h-px w-full shrink-0"
        />
        <div
          ref={messagesEndRef}
          className="min-h-[24px] min-w-[24px] shrink-0"
        />

        {welcomeSection}
      </div>

      <ScrollDownButton
        show={showScrollToBottom}
        onClick={handleScrollDownClick}
      />
    </div>
  );
}

export const Messages = PureMessages;

function ScrollDownButton({
  show,
  onClick,
}: {
  show: boolean;
  onClick: () => void;
}) {
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
        onClick={onClick}
      >
        <ArrowDown size={16} />
      </Button>
    </div>
  );
}
