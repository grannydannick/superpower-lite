import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { FileUIPart, type UIMessage } from 'ai';
import {
  animate,
  m,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import { flushSync } from 'react-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { useCreateFollowups } from '@/features/messages/api/create-followups';
import {
  DEFAULT_MESSAGES_PAGE_SIZE,
  getMessages,
  getTimelineQueryOptions,
} from '@/features/messages/api/get-messages';
import { ChatSuggestion } from '@/features/messages/components/chat-suggestion';
import { useSetupActions } from '@/features/messages/hooks/use-setup-actions';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { scrollChatToBottom } from '@/features/messages/utils/chat-scroll';
import { createChatV2Transport } from '@/features/messages/utils/chatv2-transport';
import { extractTiming } from '@/features/messages/utils/extract-timing';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';

import {
  useMessageQueue,
  type QueuedMessage,
} from '../../hooks/use-message-queue';

import { classifyChatError } from './chat-error-utils';
import { ChatHistoryHint } from './chat-history-hint';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { type Preset, PRESET_MESSAGES } from './preset-messages';
import { QueuedMessages } from './queued-messages';
import { Greeting } from './welcome/greeting';
import {
  HORIZONTAL_EDGE_FADE_MASK,
  HORIZONTAL_EDGE_FADE_MASK_LG_RESET,
  type SetupAction,
  SuggestedActions,
} from './welcome/suggested-actions';

const publicErrors = ['Too many requests, please try again later.'] as const;

const conciergeLoadErrorMessage =
  'Currently chat is under heavy load. Please try again later.';

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error && typeof err.message === 'string') {
    return err.message;
  }

  if (isObjectRecord(err) && typeof err.message === 'string') {
    return err.message;
  }

  return '';
};

const getErrorName = (err: unknown): string => {
  if (err instanceof Error && typeof err.name === 'string') {
    return err.name;
  }

  if (isObjectRecord(err) && typeof err.name === 'string') {
    return err.name;
  }

  return '';
};

const getErrorBody = (err: unknown): string => {
  if (typeof err === 'string') {
    return err;
  }

  if (err instanceof Error) {
    const errorWithExtra = err as Error & Record<string, unknown>;
    const payload: Record<string, unknown> = {
      name: err.name,
      message: err.message,
    };

    for (const [key, value] of Object.entries(errorWithExtra)) {
      if (typeof value !== 'function' && key !== 'name' && key !== 'message') {
        payload[key] = value;
      }
    }

    try {
      return JSON.stringify(payload);
    } catch {
      return err.message || err.name || 'Unknown chat error';
    }
  }

  if (isObjectRecord(err)) {
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  return String(err);
};

function parseJsonErrorCode(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) return null;

  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;
    if (typeof json.code === 'string') return json.code;

    const message = json.message;
    if (typeof message === 'string') {
      const nested = parseJsonErrorCode(message);
      if (nested) return nested;
    }

    const error = json.error;
    if (error && typeof error === 'object' && !Array.isArray(error)) {
      const nestedCode = (error as Record<string, unknown>).code;
      if (typeof nestedCode === 'string') return nestedCode;
    }

    return null;
  } catch {
    return null;
  }
}

function isNetworkError(err: unknown): boolean {
  const message = getErrorMessage(err).toLowerCase();
  return (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('the operation was aborted.')
  );
}

export function Chat({
  initialMessages,
  jumpToMessageRef,
  onJumpReady,
  isSearchOpen,
}: {
  initialMessages: Array<UIMessage>;
  jumpToMessageRef?: MutableRefObject<
    ((messageId: string) => Promise<void>) | null
  >;
  onJumpReady?: (fn: (messageId: string) => Promise<void>) => void;
  isSearchOpen?: boolean;
}) {
  const controller = useConciergeChatController({ initialMessages });

  // Expose jumpToMessage to parent via ref (no effects needed).
  if (jumpToMessageRef) {
    jumpToMessageRef.current = controller.jumpToMessage;
  }

  // Notify parent that jumpToMessage is available (for reactive deep-linking).
  useEffect(() => {
    onJumpReady?.(controller.jumpToMessage);
  }, [onJumpReady, controller.jumpToMessage]);

  return (
    <ChatView
      messages={controller.messages}
      setMessages={controller.setMessages}
      status={controller.status}
      showLoadErrorBanner={controller.showLoadErrorBanner}
      showReconnectBanner={controller.showReconnectBanner}
      onReconnect={controller.handleReconnect}
      assistantBusyMessage={controller.assistantBusyMessage}
      input={controller.input}
      setInput={controller.setInput}
      attachments={controller.attachments}
      setAttachments={controller.setAttachments}
      sendMessage={controller.sendMessage}
      hasMoreOlder={controller.hasMoreOlder}
      isLoadingOlder={controller.isLoadingOlder}
      onLoadOlder={controller.onLoadOlder}
      hasMoreNewer={controller.hasMoreNewer}
      isLoadingNewer={controller.isLoadingNewer}
      onLoadNewer={controller.onLoadNewer}
      didJump={controller.didJump}
      onJumpToLatest={controller.resetToLatest}
      isSearchOpen={isSearchOpen}
      preset={controller.preset}
      queue={controller.queue}
      removeFromQueue={controller.removeFromQueue}
    />
  );
}

function useConciergeChatController({
  initialMessages,
}: {
  initialMessages: Array<UIMessage>;
}) {
  const defaultMessage = useSearch({
    from: '/_app/concierge',
    select: (s) => s.defaultMessage,
  });
  const preset = useSearch({
    from: '/_app/concierge',
    select: (s) => s.preset,
  });
  const autoSend = useSearch({
    from: '/_app/concierge',
    select: (s) => s.autoSend,
  });
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const navigate = useNavigate({ from: '/concierge' });

  const lastReportedErrorRef = useRef<string | null>(null);
  const clearErrorAfterFinishRef = useRef(false);
  const pendingSendSnapshotRef = useRef<UIMessage[] | null>(null);
  const pendingSendInputRef = useRef<string | null>(null);
  const hasResumedRef = useRef(false);
  const [resumeKey, setResumeKey] = useState(0);

  const [input, setInput] = useState(defaultMessage ?? '');
  const [attachments, setAttachments] = useState<Array<FileUIPart>>(() =>
    useChatStore.getState().consumePendingFiles(),
  );
  const [showLoadErrorBanner, setShowLoadErrorBanner] = useState(false);
  const [showReconnectBanner, setShowReconnectBanner] = useState(false);
  const [assistantBusyMessage, setAssistantBusyMessage] = useState<
    string | null
  >(null);

  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(
    initialMessages.length >= DEFAULT_MESSAGES_PAGE_SIZE,
  );
  const [didJump, setDidJump] = useState(false);
  const [hasMoreNewer, setHasMoreNewer] = useState(false);
  const [isLoadingNewer, setIsLoadingNewer] = useState(false);

  const { data: user } = useUser();

  // Capture mount-time values in refs so the memo below doesn't go stale
  // when navigation clears `preset` before `user?.firstName` loads.
  const initialMessagesRef = useRef(initialMessages);
  const initialPresetRef = useRef(preset);

  // Build initial messages with preset message appended synchronously so it
  // renders on the very first paint (no flash from a useEffect).
  const initialMessagesWithPreset = useMemo(() => {
    const p = initialPresetRef.current;
    if (p == null) return initialMessagesRef.current;
    return [
      ...initialMessagesRef.current,
      {
        id: `preset-${p}`,
        role: 'assistant' as const,
        parts: [
          {
            type: 'text' as const,
            text: `Hi ${user?.firstName ?? 'there'}!\n\n${PRESET_MESSAGES[p as Preset]}`,
          },
        ],
      },
    ];
  }, [user?.firstName]);

  const transport = useMemo(() => createChatV2Transport<UIMessage>(), []);

  const reportChatError = useCallback(
    (errorBody: string) => {
      const normalizedError = errorBody.trim() || 'Unknown chat error';
      if (lastReportedErrorRef.current === normalizedError) return;
      lastReportedErrorRef.current = normalizedError;

      track('ai_chat_error', {
        error: normalizedError,
      });
    },
    [track],
  );

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    clearError,
    resumeStream,
  } = useChat({
    transport,
    messages: initialMessagesWithPreset,
    generateId: () => crypto.randomUUID(),
    onFinish: ({ message, isAbort, isDisconnect, isError }) => {
      if (isAbort) return;

      void queryClient.invalidateQueries({
        queryKey: getTimelineQueryOptions().queryKey,
      });

      if (isDisconnect) {
        console.debug('chat stream disconnected');
        setShowReconnectBanner(true);
        setShowLoadErrorBanner(false);
        return;
      }

      if (isError) {
        if (clearErrorAfterFinishRef.current) {
          clearErrorAfterFinishRef.current = false;
          setShowLoadErrorBanner(false);
          setShowReconnectBanner(false);
          clearError();
        }
        return;
      }

      pendingSendSnapshotRef.current = null;
      pendingSendInputRef.current = null;
      setShowReconnectBanner(false);
      setShowLoadErrorBanner(false);

      if (message.role !== 'assistant') return;

      const timing = extractTiming(message, false);
      track('received_message_ai', {
        response_time: timing.totalMs,
      });
    },
    onError: (err) => {
      console.warn('chat error', err);

      clearErrorAfterFinishRef.current = false;
      setAssistantBusyMessage(null);

      const safeMessage = getErrorMessage(err);
      const safeName = getErrorName(err);
      const errorBody = getErrorBody(err);
      const errorCode =
        parseJsonErrorCode(safeMessage) ?? parseJsonErrorCode(errorBody);

      const errorKind = classifyChatError({
        errorName: safeName,
        errorMessage: safeMessage,
        publicErrors,
      });

      const safeMessageLower = safeMessage.toLowerCase();
      const assistantResponseAlreadyInProgress =
        errorCode === 'ASSISTANT_RESPONSE_IN_PROGRESS' ||
        safeMessageLower.includes(
          'assistant response is already being generated',
        ) ||
        errorBody.includes('ASSISTANT_RESPONSE_IN_PROGRESS');

      if (assistantResponseAlreadyInProgress) {
        const pendingSendSnapshot = pendingSendSnapshotRef.current;
        const pendingSendInput = pendingSendInputRef.current;

        if (pendingSendSnapshot != null) {
          setMessages(pendingSendSnapshot);
        }
        if (pendingSendInput != null && pendingSendInput.length > 0) {
          setInput(pendingSendInput);
        }

        pendingSendSnapshotRef.current = null;
        pendingSendInputRef.current = null;
        setShowLoadErrorBanner(false);
        setShowReconnectBanner(false);
        setAssistantBusyMessage(
          'I\u2019m still finishing a reply. I can only generate one response at a time, but I\u2019ll be ready for your next message in a moment.',
        );
        return;
      }

      if (errorKind === 'validation') {
        clearErrorAfterFinishRef.current = true;
        setShowLoadErrorBanner(false);
        setShowReconnectBanner(false);
        track('ai_sdk_validation_error', {
          error_message: safeMessage,
          error_name: safeName,
        });
        return;
      }

      if (errorKind === 'public') {
        setShowLoadErrorBanner(false);
        setShowReconnectBanner(false);
        toast(safeMessage);
        return;
      }

      if (isNetworkError(err)) {
        setShowLoadErrorBanner(false);
        setShowReconnectBanner(true);
        reportChatError(errorBody);
        return;
      }

      setShowLoadErrorBanner(true);
      setShowReconnectBanner(false);
      reportChatError(errorBody);
    },
  });

  const messagesRef = useRef(messages);
  const oldestMessageRef = useRef<UIMessage | undefined>(messages[0]);
  const newestMessageRef = useRef<UIMessage | undefined>(
    messages[messages.length - 1],
  );
  useEffect(() => {
    messagesRef.current = messages;
    oldestMessageRef.current = messages[0];
    newestMessageRef.current = messages[messages.length - 1];
  }, [messages]);

  const handleReconnect = useCallback(() => {
    setShowReconnectBanner(false);
    setShowLoadErrorBanner(false);
    hasResumedRef.current = false;
    setResumeKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (hasResumedRef.current) return;
    if (status === 'streaming' || status === 'submitted') return;
    if (resumeKey === 0) {
      if (messages.length === 0) return;
      if (messages.at(-1)?.role !== 'user') return;
    }
    hasResumedRef.current = true;
    if (resumeKey > 0) {
      setMessages((prev) => {
        if (prev.length > 0 && prev.at(-1)?.role === 'assistant') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    }
    void resumeStream();
  }, [messages, status, resumeStream, resumeKey, setMessages]);

  const onLoadOlder = useCallback(async () => {
    if (!hasMoreOlder || isLoadingOlder) return;

    const oldest = oldestMessageRef.current;
    if (!oldest) {
      setHasMoreOlder(false);
      return;
    }

    setIsLoadingOlder(true);
    try {
      const page = await getMessages({
        cursor: { id: oldest.id },
        sort: 'desc',
        limit: DEFAULT_MESSAGES_PAGE_SIZE,
      });

      if (page.length === 0) {
        setHasMoreOlder(false);
        return;
      }

      if (page.length < DEFAULT_MESSAGES_PAGE_SIZE) {
        setHasMoreOlder(false);
      }

      const olderAsc = page.slice().reverse();

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const unique = olderAsc.filter((m) => !existingIds.has(m.id));
        return unique.length > 0 ? [...unique, ...prev] : prev;
      });
    } catch (err) {
      console.warn('Failed to load older messages', err);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [hasMoreOlder, isLoadingOlder, setMessages]);

  const onLoadNewer = useCallback(async () => {
    if (!hasMoreNewer || isLoadingNewer) return;

    const newest = newestMessageRef.current;
    if (!newest) {
      setHasMoreNewer(false);
      return;
    }

    setIsLoadingNewer(true);
    try {
      const page = await getMessages({
        cursor: { id: newest.id },
        sort: 'asc',
        limit: DEFAULT_MESSAGES_PAGE_SIZE,
        hideToast: true,
      });

      if (page.length === 0 || page.length < DEFAULT_MESSAGES_PAGE_SIZE) {
        setHasMoreNewer(false);
      }

      if (page.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const unique = page.filter((m) => !existingIds.has(m.id));
          return unique.length > 0 ? [...prev, ...unique] : prev;
        });
      }
    } catch (err) {
      console.warn('Failed to load newer messages', err);
    } finally {
      setIsLoadingNewer(false);
    }
  }, [hasMoreNewer, isLoadingNewer, setMessages]);

  const onQueueSend = useCallback(
    (msg: { text: string; files: FileUIPart[] }) => {
      pendingSendSnapshotRef.current = messagesRef.current;
      pendingSendInputRef.current = msg.text.length > 0 ? msg.text : null;

      track('sent_message_ai', { message_length: msg.text.length });
      if (preset === 'import-memory') {
        track('import_memory_submitted', {
          message_length: msg.text.length,
        });
      }
      lastReportedErrorRef.current = null;
      setShowLoadErrorBanner(false);
      setShowReconnectBanner(false);
      setAssistantBusyMessage(null);

      sendMessage({
        ...(msg.text ? { text: msg.text } : {}),
        files: msg.files,
      });
    },
    [sendMessage, track, setAssistantBusyMessage, preset],
  );

  const {
    queue,
    enqueue,
    remove: removeFromQueue,
  } = useMessageQueue({
    status,
    onSend: onQueueSend,
  });

  // Reset from a jumped (historical) view back to the latest messages.
  // Shared by handleSendMessage and the scroll-to-bottom button.
  const resetToLatest = useCallback(async () => {
    try {
      const timeline = await queryClient.fetchQuery(
        getTimelineQueryOptions({ hideToast: true }),
      );
      setMessages(timeline);
      setHasMoreOlder(timeline.length >= DEFAULT_MESSAGES_PAGE_SIZE);
      setHasMoreNewer(false);
      setDidJump(false);
      // Instant scroll to bottom — the handleScroll listener will
      // detect we're at the bottom and re-enable auto-scroll.
      scrollChatToBottom({ behavior: 'instant', immediate: true });
    } catch (err) {
      console.warn('Failed to reset messages after jump', err);
    }
  }, [queryClient, setMessages]);

  const handleSendMessage: typeof sendMessage = useCallback(
    async (message, options) => {
      if (
        (defaultMessage != null && defaultMessage.length > 0) ||
        preset != null
      ) {
        void navigate({
          search: (prev) => ({
            ...prev,
            defaultMessage: undefined,
            preset: undefined,
          }),
          replace: true,
        });
      }

      // If we jumped to an old message via search, reset to the latest
      // messages before sending so there are no gaps in the timeline.
      if (didJump) {
        await resetToLatest();
      }

      pendingSendSnapshotRef.current = messagesRef.current;
      let messageLength = 0;
      let messageText = '';
      if (message !== undefined) {
        if ('text' in message && typeof message.text === 'string') {
          messageLength = message.text.length;
          messageText = message.text;
        } else if ('parts' in message && Array.isArray(message.parts)) {
          for (const part of message.parts) {
            if (part.type === 'text') {
              messageLength += part.text.length;
              messageText += part.text;
            }
          }
        }
      }
      pendingSendInputRef.current = messageText.length > 0 ? messageText : null;

      lastReportedErrorRef.current = null;
      setShowLoadErrorBanner(false);
      setShowReconnectBanner(false);
      setAssistantBusyMessage(null);
      setInput('');

      if (status === 'ready' || status === 'error') {
        track('sent_message_ai', {
          message_length: messageLength,
        });
        if (preset === 'import-memory') {
          track('import_memory_submitted', {
            message_length: messageLength,
          });
        }
        return sendMessage(message, options);
      }

      const msg = message as { text?: string; files?: FileUIPart[] };
      enqueue({ text: msg.text ?? '', files: msg.files ?? [] });
    },
    [
      defaultMessage,
      didJump,
      enqueue,
      navigate,
      preset,
      resetToLatest,
      sendMessage,
      status,
      track,
      setAssistantBusyMessage,
    ],
  );

  const defaultMessageAutoSentRef = useRef(false);
  const defaultMessageAutoSendTimeoutIdRef = useRef<number | null>(null);
  const attachmentAutoSentRef = useRef(false);
  const attachmentAutoSendTimeoutIdRef = useRef<number | null>(null);
  const handleSendMessageRef = useRef(handleSendMessage);

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  useEffect(() => {
    if (defaultMessage == null || defaultMessage.length === 0) return;
    if (status !== 'ready') return;
    if (defaultMessageAutoSentRef.current) return;
    if (defaultMessageAutoSendTimeoutIdRef.current != null) return;

    defaultMessageAutoSendTimeoutIdRef.current = window.setTimeout(() => {
      defaultMessageAutoSendTimeoutIdRef.current = null;

      if (defaultMessageAutoSentRef.current) return;

      defaultMessageAutoSentRef.current = true;
      void handleSendMessageRef.current({ text: defaultMessage, files: [] });
    }, 0);

    return () => {
      if (defaultMessageAutoSendTimeoutIdRef.current == null) return;
      window.clearTimeout(defaultMessageAutoSendTimeoutIdRef.current);
      defaultMessageAutoSendTimeoutIdRef.current = null;
    };
  }, [defaultMessage, status]);

  useEffect(() => {
    if (!autoSend) return;
    if (attachments.length === 0) return;
    if (status !== 'ready') return;
    if (attachmentAutoSentRef.current) return;
    if (attachmentAutoSendTimeoutIdRef.current != null) return;

    const filesToSend = [...attachments];

    attachmentAutoSendTimeoutIdRef.current = window.setTimeout(() => {
      attachmentAutoSendTimeoutIdRef.current = null;

      if (attachmentAutoSentRef.current) return;

      attachmentAutoSentRef.current = true;
      setAttachments([]);
      void handleSendMessageRef.current({ files: filesToSend });
    }, 100);

    return () => {
      if (attachmentAutoSendTimeoutIdRef.current == null) return;
      window.clearTimeout(attachmentAutoSendTimeoutIdRef.current);
      attachmentAutoSendTimeoutIdRef.current = null;
    };
  }, [autoSend, attachments, status, setAttachments]);

  // DEV: Simulate data-compaction by injecting fake parts into the last assistant message
  useEffect(() => {
    if (!env.DEV_TOOLS_ENABLED) return;

    const handler = () => {
      setMessages((prev) => {
        // Find the last assistant message
        let lastAssistantIdx = -1;
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].role === 'assistant') {
            lastAssistantIdx = i;
            break;
          }
        }
        if (lastAssistantIdx === -1) {
          toast.error('No assistant message to inject compaction into');
          return prev;
        }

        const msg = prev[lastAssistantIdx];
        const now = new Date().toISOString();

        // First inject in-progress, then schedule complete after 3s
        const inProgressPart = {
          type: 'data-compaction' as const,
          data: {
            state: 'in-progress' as const,
            reason: 'threshold' as const,
            startedAt: now,
            tokensBefore: 185_000,
          },
        };

        const updated = [...prev];
        updated[lastAssistantIdx] = {
          ...msg,
          parts: [...msg.parts, inProgressPart],
        };

        // After 3s, replace with complete state
        setTimeout(() => {
          setMessages((current) => {
            const idx = current.findIndex((m) => m.id === msg.id);
            if (idx === -1) return current;

            const completePart = {
              type: 'data-compaction' as const,
              data: {
                state: 'complete' as const,
                reason: 'threshold' as const,
                startedAt: now,
                completedAt: new Date().toISOString(),
                chatSummaryId: crypto.randomUUID(),
                summary: 'Simulated compaction summary for dev testing.',
                tokensBefore: 185_000,
                tokensAfter: 42_000,
              },
            };

            const next = [...current];
            const currentMsg = current[idx];
            // Replace in-progress part with complete part
            const partsWithoutInProgress = currentMsg.parts.filter(
              (p) =>
                !(
                  (p as { type?: string }).type === 'data-compaction' &&
                  (p as { data?: { state?: string } }).data?.state ===
                    'in-progress'
                ),
            );
            next[idx] = {
              ...currentMsg,
              parts: [...partsWithoutInProgress, completePart],
            };
            return next;
          });
        }, 3000);

        return updated;
      });
    };

    window.addEventListener('dev:simulate-compaction', handler);
    return () => window.removeEventListener('dev:simulate-compaction', handler);
  }, [setMessages]);

  // Jump to a specific message: fetch a window of messages centred on the
  // target, replace the current list, and scroll to it. Normal pagination
  // (onLoadOlder) resumes from there.
  const jumpToMessage = useCallback(
    async (messageId: string) => {
      // Already in the DOM? Flush state synchronously so the layout
      // settles (greeting removal, etc.) before we scroll.
      const existing = document.getElementById(`message-${messageId}`);
      if (existing) {
        flushSync(() => setDidJump(true));
        existing.scrollIntoView({ behavior: 'instant', block: 'center' });
        return;
      }

      // 1. Fetch the target + older context.
      //    skip=0 includes the cursor message itself in the page.
      const descPage = await getMessages({
        cursor: { id: messageId, skip: 0 },
        sort: 'desc',
        limit: DEFAULT_MESSAGES_PAGE_SIZE,
        hideToast: true,
      });

      if (descPage.length === 0) throw new Error('Message not found');

      // 2. Fetch newer context. If skip=0 worked the target is in descPage
      //    and we fetch forward from it. Otherwise page[0] (desc = newest
      //    first) is the message right before the target — fetching forward
      //    from there picks the target up as the first result.
      const hasTarget = descPage.some((m) => m.id === messageId);
      const ascCursor = hasTarget ? messageId : descPage[0].id;
      const ascPage = await getMessages({
        cursor: { id: ascCursor },
        sort: 'asc',
        limit: DEFAULT_MESSAGES_PAGE_SIZE,
        hideToast: true,
      });

      // 3. Combine into a single chronological page and deduplicate.
      const olderAsc = descPage.slice().reverse();
      const seen = new Set<string>();
      const combined = [...olderAsc, ...ascPage].filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      // 4. Replace the entire message list and flush synchronously so
      //    the DOM is fully updated (greeting removed, messages rendered)
      //    before we try to scroll.
      flushSync(() => {
        setDidJump(true);
        setMessages(combined);
        setHasMoreOlder(descPage.length >= DEFAULT_MESSAGES_PAGE_SIZE);
        setHasMoreNewer(ascPage.length >= DEFAULT_MESSAGES_PAGE_SIZE);
      });

      // 5. Element should now be in the DOM. Scroll to it.
      const el = document.getElementById(`message-${messageId}`);
      if (!el) throw new Error('Message not found');
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
    },
    [setMessages, setHasMoreOlder, setHasMoreNewer, setDidJump],
  );

  return {
    messages,
    setMessages,
    status,
    showLoadErrorBanner,
    showReconnectBanner,
    handleReconnect,
    assistantBusyMessage,
    input,
    setInput,
    attachments,
    setAttachments,
    sendMessage: handleSendMessage,
    hasMoreOlder,
    isLoadingOlder,
    onLoadOlder,
    hasMoreNewer,
    isLoadingNewer,
    onLoadNewer,
    jumpToMessage,
    didJump,
    resetToLatest,
    preset,
    queue,
    removeFromQueue,
  };
}

interface ChatViewProps {
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  status: UseChatHelpers<UIMessage>['status'];
  showLoadErrorBanner: boolean;
  showReconnectBanner: boolean;
  onReconnect: () => void;
  assistantBusyMessage: string | null;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  attachments: Array<FileUIPart>;
  setAttachments: Dispatch<SetStateAction<Array<FileUIPart>>>;
  sendMessage: UseChatHelpers<UIMessage>['sendMessage'];
  hasMoreOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void | Promise<void>;
  hasMoreNewer: boolean;
  isLoadingNewer: boolean;
  onLoadNewer: () => void | Promise<void>;
  didJump: boolean;
  onJumpToLatest: () => Promise<void>;
  isSearchOpen?: boolean;
  preset?: string;
  queue: QueuedMessage[];
  removeFromQueue: (id: string) => void;
}

function WelcomeContent({
  onSend,
  setupActions,
  hasHistory = false,
  suggestionsOverride,
  welcomeProgress,
  onDismiss,
}: {
  onSend: (text: string) => void;
  setupActions: SetupAction[];
  hasHistory?: boolean;
  suggestionsOverride?: string[];
  welcomeProgress: MotionValue<number>;
  onDismiss: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Greeting />
      <div className="flex w-full">
        <SuggestedActions
          onSendSuggestion={onSend}
          setupActions={setupActions}
          variant="welcome"
          suggestionsOverride={suggestionsOverride}
        />
      </div>
      {/* Rendered last so it paints on top of Greeting's dune gradient
          via natural document order (no z-index). */}
      {hasHistory && (
        <ChatHistoryHint progress={welcomeProgress} onClick={onDismiss} />
      )}
    </div>
  );
}

function ChatView({
  messages,
  setMessages,
  status,
  showLoadErrorBanner,
  showReconnectBanner,
  assistantBusyMessage,
  onReconnect,
  input,
  setInput,
  attachments,
  setAttachments,
  sendMessage,
  hasMoreOlder,
  isLoadingOlder,
  onLoadOlder,
  hasMoreNewer,
  isLoadingNewer,
  onLoadNewer,
  didJump,
  onJumpToLatest,
  isSearchOpen,
  preset,
  queue,
  removeFromQueue,
}: ChatViewProps) {
  const setup = useSetupActions();

  const hasInteractedRef = useRef(messages.length > 0);
  const hasSentMessageThisLoadRef = useRef(false);
  const isActiveStream = status === 'streaming' || status === 'submitted';

  // Latch to true once any real interaction is detected. A ref is
  // sufficient because every trigger is always accompanied by a
  // state/prop change that causes a re-render.
  if (messages.length > 0 || isActiveStream || didJump) {
    hasInteractedRef.current = true;
  }

  const effectiveHasInteracted = hasInteractedRef.current;

  // Welcome reveal: progress 0 = welcome covers viewport, 1 = chat
  // fully revealed. Driven by scroll while welcome is open; animated
  // to 1 when welcome is dismissed (send, scroll-down click, etc.).
  const [showWelcome, setShowWelcome] = useState(true);
  const welcomeProgress = useMotionValue(0);
  const closeWelcome = useCallback(() => {
    setShowWelcome((prev) => {
      if (!prev) return prev;
      animate(welcomeProgress, 1, {
        duration: 0.8,
        ease: [0.32, 0.72, 0, 1],
      });
      return false;
    });
  }, [welcomeProgress]);

  useEffect(() => {
    if (isActiveStream || didJump) closeWelcome();
  }, [isActiveStream, didJump, closeWelcome]);

  // Bottom-bar reveal is driven entirely by welcomeProgress (store).
  const bottomBarNaturalHeight = useMotionValue(0);
  const bottomBarHeight = useTransform(
    () => welcomeProgress.get() * bottomBarNaturalHeight.get(),
  );
  const bottomBarContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bottomBarContentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      bottomBarNaturalHeight.set(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [bottomBarNaturalHeight]);

  // Wrap sendMessage to track user interaction for scroll behavior
  const handleSend: typeof sendMessage = useCallback(
    (...args) => {
      hasInteractedRef.current = true;
      hasSentMessageThisLoadRef.current = true;
      closeWelcome();
      return sendMessage(...args);
    },
    [sendMessage, closeWelcome],
  );

  // When a preset is selected from the welcome screen, hide greeting and show the preset message
  const { data: user } = useUser();
  useEffect(() => {
    if (preset == null || hasSentMessageThisLoadRef.current) return;
    hasInteractedRef.current = true;
    closeWelcome();

    const presetText = PRESET_MESSAGES[preset as Preset];
    if (!presetText) return;

    setMessages((prev) => {
      if (prev.some((m) => m.id === `preset-${preset}`)) return prev;
      return [
        ...prev,
        {
          id: `preset-${preset}`,
          role: 'assistant' as const,
          parts: [
            {
              type: 'text' as const,
              text: `Hi ${user?.firstName ?? 'there'}!\n\n${presetText}`,
            },
          ],
        },
      ];
    });
  }, [preset, setMessages, user?.firstName, closeWelcome]);

  const isUploadLabsPreset = preset === 'upload-labs';
  const presetIsLastMessage =
    preset != null && messages.at(-1)?.id === `preset-${preset}`;
  const showDropzone =
    isUploadLabsPreset && presetIsLastMessage && attachments.length === 0;

  const setupActions = useMemo(() => {
    const actions: SetupAction[] = [];
    if (setup.uploadLabs.visible) {
      actions.push({
        id: 'upload-labs',
        title: 'Upload past labs',
        subtitle: 'See trends from your past labs.',
        imageSrc: '/concierge/lab-upload.webp',
        onClick: setup.uploadLabs.onClick,
        onDismiss: setup.uploadLabs.dismiss,
      });
    }
    if (setup.importMemory.visible) {
      actions.push({
        id: 'import-memory',
        title: 'Continue from another AI',
        subtitle: 'Import your conversations and deepen your health story.',
        imageSrc: '/concierge/other_llms.webp',
        onClick: setup.importMemory.onClick,
        onDismiss: setup.importMemory.dismiss,
      });
    }
    return actions;
  }, [setup.uploadLabs, setup.importMemory]);

  const showErrorUi =
    status === 'error' ||
    showLoadErrorBanner ||
    showReconnectBanner ||
    assistantBusyMessage != null;

  // Suggestions: show after the latest assistant response when idle
  const lastAssistantMessage =
    status === 'ready'
      ? [...messages].reverse().find((m) => m.role === 'assistant')
      : undefined;
  const followupContext = useMemo(() => {
    if (!lastAssistantMessage) return '';
    const textParts = lastAssistantMessage.parts
      .filter(
        (p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text',
      )
      .map((p) => p.text)
      .join(' ');
    return textParts.slice(0, 2000);
  }, [lastAssistantMessage]);

  const presetAwaitingResponse = presetIsLastMessage;
  const showSetupActions =
    effectiveHasInteracted &&
    !hasSentMessageThisLoadRef.current &&
    !presetAwaitingResponse &&
    setupActions.length > 0 &&
    status === 'ready' &&
    queue.length === 0;
  const showSuggestions =
    effectiveHasInteracted &&
    messages.length > 0 &&
    status === 'ready' &&
    queue.length === 0 &&
    !presetAwaitingResponse &&
    !showSetupActions;
  // Keep a ref of the last successfully fetched followups so they
  // survive a jump (query key changes when messages are replaced,
  // which would clear cached data and cause a layout shift).
  const stableFollowupsRef = useRef<string[]>([]);
  const { data: rawFollowups = [] } = useCreateFollowups({
    context: followupContext,
    count: 3,
    // Disable fetching during a jump so we don't request suggestions
    // for historical context. New ones are fetched after the user
    // sends a message and the stream completes.
    enabled: showSuggestions && !didJump && followupContext.length > 0,
  });

  if (rawFollowups.length > 0 && !didJump) {
    stableFollowupsRef.current = rawFollowups;
  }

  const followups = didJump ? stableFollowupsRef.current : rawFollowups;

  const welcomeContent = (
    <WelcomeContent
      onSend={(text) => void handleSend({ text, files: [] }, undefined)}
      setupActions={setupActions}
      hasHistory={messages.length > 0}
      suggestionsOverride={lastAssistantMessage ? followups : undefined}
      welcomeProgress={welcomeProgress}
      onDismiss={closeWelcome}
    />
  );

  return (
    <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-3xl flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <Messages
          messages={messages}
          setMessages={setMessages}
          status={status}
          hasMoreOlder={hasMoreOlder}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={onLoadOlder}
          hasMoreNewer={hasMoreNewer}
          isLoadingNewer={isLoadingNewer}
          onLoadNewer={onLoadNewer}
          onJumpToLatest={onJumpToLatest}
          didJump={didJump}
          isSearchOpen={isSearchOpen}
          welcomeContent={welcomeContent}
          showWelcome={showWelcome}
          onCloseWelcome={closeWelcome}
          welcomeProgress={welcomeProgress}
        />
      </div>

      <div className="shrink-0">
        {showErrorUi && showReconnectBanner && (
          <div className="mx-auto mb-3 w-full max-w-3xl px-1">
            <Alert variant="destructive">
              <AlertTitle>Connection lost</AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-3">
                <span>Reconnect to continue the last response.</span>
                <Button type="button" variant="outline" onClick={onReconnect}>
                  Reconnect
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        {showErrorUi && showLoadErrorBanner && (
          <div className="mx-auto mb-3 w-full max-w-3xl px-1">
            <Alert variant="destructive">
              <AlertTitle>Concierge is experiencing high demand</AlertTitle>
              <AlertDescription>{conciergeLoadErrorMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        {showErrorUi && assistantBusyMessage != null && (
          <div className="mx-auto mb-3 w-full max-w-3xl px-1">
            <Alert variant="destructive">
              <AlertTitle>One moment</AlertTitle>
              <AlertDescription>{assistantBusyMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        <QueuedMessages queue={queue} onRemove={removeFromQueue} />

        <m.div
          style={{ height: bottomBarHeight, opacity: welcomeProgress }}
          className="overflow-hidden"
        >
          <div ref={bottomBarContentRef}>
            {showSetupActions && (
              <SuggestedActions
                onSendSuggestion={(text) =>
                  void handleSend({ text, files: [] })
                }
                setupActions={setupActions}
                variant="inline"
              />
            )}

            {showSuggestions && followups.length > 0 && (
              <div
                className={`mx-auto flex w-full gap-2 overflow-x-auto px-3 pb-3 pt-1 scrollbar-none ${HORIZONTAL_EDGE_FADE_MASK} lg:flex-wrap lg:justify-start ${HORIZONTAL_EDGE_FADE_MASK_LG_RESET}`}
              >
                {followups.map((suggestion) => (
                  <ChatSuggestion
                    key={suggestion}
                    className="min-w-[200px] flex-1 shrink-0"
                    disableEnterAnimation
                    onClick={() =>
                      void handleSend({ text: suggestion, files: [] })
                    }
                    suggestion={suggestion}
                  />
                ))}
              </div>
            )}
          </div>
        </m.div>

        <form className="mx-auto w-full pb-2">
          <MultimodalInput
            input={input}
            setInput={setInput}
            sendMessage={handleSend}
            status={status}
            attachments={attachments}
            setAttachments={setAttachments}
            disableFileUpload={!isUploadLabsPreset}
            allowSendWithAttachmentsOnly={isUploadLabsPreset}
            showLabUploadDropzone={showDropzone}
            onFocus={messages.length > 0 ? closeWelcome : undefined}
          />
        </form>

        <p className="mx-auto max-w-xl pb-2 text-center text-[10px] text-zinc-400">
          Your Superpower AI is not intended to replace medical advice, and
          solely provided solely to offer suggestions and education. Always seek
          the advice of a licensed human healthcare provider for any medical
          questions and call 911 or go to the emergency room if you are
          experiencing an emergent medical issue.
        </p>
      </div>
    </div>
  );
}
