import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import {
  AnimatePresence,
  animate,
  m,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
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
  CHAT_NEAR_BOTTOM_THRESHOLD_PX,
  useChatScroll,
} from '@/features/messages/hooks/use-chat-scroll';
import { CHAT_SCROLL_CONTAINER_ID } from '@/features/messages/utils/chat-scroll';
import { cn } from '@/lib/utils';

import { PreviewMessage, ThinkingMessage } from './message';

// Fraction of viewport height the user must scroll up before welcome
// closes itself. Below this, welcome snaps back to the bottom on
// scroll release.
const WELCOME_DISMISS_THRESHOLD = 0.2;
const WELCOME_SNAP_BACK_DELAY_MS = 150;

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
  showWelcome: boolean;
  onCloseWelcome: () => void;
  welcomeProgress: MotionValue<number>;
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
  showWelcome,
  onCloseWelcome,
  welcomeProgress,
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
  const snapBackTimerRef = useRef<number | null>(null);
  const suppressAutoScroll = didJump || isSearchOpen;
  const suppressAutoScrollRef = useRef(suppressAutoScroll);
  suppressAutoScrollRef.current = suppressAutoScroll;
  const welcomeVisible = welcomeContent != null && !didJump && showWelcome;
  const welcomeVisibleRef = useRef(welcomeVisible);
  welcomeVisibleRef.current = welcomeVisible;

  const { distanceFromBottom } = useChatScroll({
    containerRef: scrollContainerRef,
  });

  // Welcome reveal: 0 = welcome covers viewport, 1 = chat fully revealed.
  // Owned by chat.tsx and shared via prop so ChatHistoryHint (inside
  // WelcomeContent) and chat.tsx's bottom-bar can read the same signal.
  const welcomeOpacity = useTransform(welcomeProgress, [0, 1], [1, 0]);
  const welcomeScale = useTransform(welcomeProgress, [0, 1], [1, 0.8]);

  const syncScrollDownButton = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container == null) {
      return;
    }

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

  useEffect(() => {
    return () => {
      if (snapBackTimerRef.current != null) {
        clearTimeout(snapBackTimerRef.current);
      }
    };
  }, []);

  const snapBackIfBelowThreshold = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el == null || !welcomeVisibleRef.current) return;
    const dfb = el.scrollHeight - el.scrollTop - el.clientHeight;
    const fraction = dfb / Math.max(el.clientHeight, 1);
    if (fraction > 0 && fraction < WELCOME_DISMISS_THRESHOLD) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  // Native `scrollend` fires once scrolling truly stops (after inertia,
  // after smooth-scroll completes). Cleaner than chasing the tail of a
  // setTimeout-based debounce.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el == null) return;
    if (!('onscrollend' in el)) return;
    el.addEventListener('scrollend', snapBackIfBelowThreshold);
    return () => el.removeEventListener('scrollend', snapBackIfBelowThreshold);
  }, [snapBackIfBelowThreshold]);

  useMotionValueEvent(distanceFromBottom, 'change', (distance) => {
    // Drive welcome reveal from the scroll signal whenever welcome is
    // visible, so progress always matches the actual scroll position
    // (including during the snap-back animation back to the bottom).
    // Auto-close is gated on `!autoScrollEnabledRef.current` so the
    // animated scroll-to-bottom on mount doesn't dismiss welcome before
    // the user has seen it.
    if (welcomeVisibleRef.current) {
      const el = scrollContainerRef.current;
      const viewport = el?.clientHeight ?? 0;
      if (viewport > 0) {
        const fraction = Math.min(Math.max(distance / viewport, 0), 1);
        welcomeProgress.set(fraction);
        if (
          fraction >= WELCOME_DISMISS_THRESHOLD &&
          !autoScrollEnabledRef.current
        ) {
          onCloseWelcome();
        }
      }
    }

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

    // Fallback snap-back via timer for browsers without `scrollend`
    // support (Safari < 17, Firefox < 109). Modern browsers use the
    // scrollend listener installed above.
    if (welcomeVisibleRef.current) {
      if (snapBackTimerRef.current != null) {
        clearTimeout(snapBackTimerRef.current);
      }
      snapBackTimerRef.current = window.setTimeout(
        snapBackIfBelowThreshold,
        WELCOME_SNAP_BACK_DELAY_MS,
      );
    }
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

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.deltaY < 0) {
      autoScrollEnabledRef.current = false;
      autoScrollAnimRef.current?.stop();
      autoScrollAnimRef.current = null;
    }
  }, []);

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
      autoScrollEnabledRef.current = false;
      autoScrollAnimRef.current?.stop();
      autoScrollAnimRef.current = null;
    }
    lastTouchYRef.current = touch.clientY;
  }, []);

  const handleScrollDownClick = useCallback(() => {
    autoScrollEnabledRef.current = true;
    onCloseWelcome();
    if (hasMoreNewer && onJumpToLatest) {
      void onJumpToLatest();
      return;
    }
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [hasMoreNewer, onJumpToLatest, onCloseWelcome]);

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

  return (
    <div
      className={cn(
        'relative flex min-h-0 flex-1 flex-col',
        messages.length === 0 && !welcomeContent && 'hidden',
      )}
    >
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

        {/* Sticky welcome panel: pinned to viewport bottom, fades and
            scales as user scrolls up. AnimatePresence handles the final
            collapse-and-unmount when welcome closes (on send / scroll
            past threshold / focus / scroll-down click). */}
        {welcomeContent != null && !didJump && (
          <AnimatePresence>
            {showWelcome && (
              <m.div
                key="welcome"
                initial={false}
                style={{
                  opacity: welcomeOpacity,
                  scale: welcomeScale,
                  transformOrigin: 'bottom',
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  minHeight: 0,
                  marginTop: -24,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1],
                }}
                className="sticky bottom-0 flex min-h-full flex-col items-center justify-center gap-6 overflow-hidden"
              >
                {welcomeContent}
              </m.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <ScrollDownButton
        show={showScrollToBottom && !welcomeVisible}
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
