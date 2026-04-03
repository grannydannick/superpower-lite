import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { FileUIPart, type UIMessage } from 'ai';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { DailyBriefCard } from '@/features/daily-brief/components/daily-brief-card';
import { getHistoryQueryOptions } from '@/features/messages/api/get-history';
import {
  DEFAULT_MESSAGES_PAGE_SIZE,
  getMessages,
  getMessagesQueryOptions,
} from '@/features/messages/api/get-messages';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { createChatV2Transport } from '@/features/messages/utils/chatv2-transport';
import { extractTiming } from '@/features/messages/utils/extract-timing';
import { OnboardingCircle } from '@/features/onboarding-circle/components/onboarding-circle';
import { useOnboardingCircleStore } from '@/features/onboarding-circle/stores/onboarding-circle-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { shouldShowImportMemory } from '@/utils/show-action-conditions';

import {
  useMessageQueue,
  type QueuedMessage,
} from '../../hooks/use-message-queue';

import { classifyChatError } from './chat-error-utils';
import { Greeting } from './greeting';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { QueuedMessages } from './queued-messages';
import { SuggestedActions } from './suggested-actions';

const publicErrors = [
  'Too many requests, please try again later.',
  'This chat has ended. Please start a new chat.',
] as const;

const conciergeLoadErrorMessage =
  'Currently chat is under heavy load. Please try again later.';

function hasAssistantContent(message: UIMessage | undefined): boolean {
  if (!message || message.role !== 'assistant') return false;

  for (const part of message.parts ?? []) {
    if (part.type !== 'text') continue;
    if (part.text.length === 0) continue;
    return true;
  }

  return false;
}

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

function hasUserMessages(messages: UIMessage[]): boolean {
  for (const message of messages) {
    if (message.role === 'user') return true;
  }

  return false;
}

function hasInProgressParts(message: UIMessage): boolean {
  for (const part of message.parts ?? []) {
    if (!isObjectRecord(part) || !('state' in part)) continue;
    const state = (part as { state?: unknown }).state;
    if (typeof state === 'string' && state.includes('streaming')) {
      return true;
    }
  }

  return false;
}

function getLastFinishStepReason(message: UIMessage): string | null {
  const meta = message.metadata as Record<string, unknown> | undefined;
  const events = meta?.events;
  if (!events || typeof events !== 'object' || Array.isArray(events)) {
    return null;
  }

  let maxSeq = -1;
  let reason: string | null = null;

  for (const [key, value] of Object.entries(events)) {
    const seq = Number(key);
    if (!Number.isFinite(seq)) continue;
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

    const ev = value as Record<string, unknown>;
    if (ev.type !== 'finish-step') continue;
    if (typeof ev.finishReason !== 'string') continue;

    if (seq > maxSeq) {
      maxSeq = seq;
      reason = ev.finishReason;
    }
  }

  return reason;
}

function isNetworkError(err: unknown): boolean {
  const message = getErrorMessage(err).toLowerCase();
  return message.includes('fetch') || message.includes('network');
}

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  const controller = useConciergeChatController({ id, initialMessages });

  return (
    <ChatView
      chatId={id}
      messages={controller.messages}
      setMessages={controller.setMessages}
      status={controller.status}
      showLoadErrorBanner={controller.showLoadErrorBanner}
      showReconnectBanner={controller.showReconnectBanner}
      assistantBusyMessage={controller.assistantBusyMessage}
      onReconnect={controller.onReconnect}
      input={controller.input}
      setInput={controller.setInput}
      attachments={controller.attachments}
      setAttachments={controller.setAttachments}
      sendMessage={controller.sendMessage}
      hasMoreOlder={controller.hasMoreOlder}
      isLoadingOlder={controller.isLoadingOlder}
      onLoadOlder={controller.onLoadOlder}
      ctxMessageId={controller.ctxMessageId}
      preset={controller.preset}
      queue={controller.queue}
      removeFromQueue={controller.removeFromQueue}
    />
  );
}

function useConciergeChatController({
  id,
  initialMessages,
}: {
  id: string;
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
  const ctxMessageId = useSearch({
    from: '/_app/concierge',
    select: (s) => s.ctxMessageId,
  });
  const autoSend = useSearch({
    from: '/_app/concierge',
    select: (s) => s.autoSend,
  });
  const hasIdParam = useParams({
    strict: false,
    select: (params) => typeof params.id === 'string' && params.id.length > 0,
  });
  const queryClient = useQueryClient();
  const { track } = useAnalytics();
  const navigate = useNavigate({ from: '/concierge' });

  const lastReportedErrorRef = useRef<string | null>(null);
  const clearErrorAfterFinishRef = useRef(false);
  const pendingSendSnapshotRef = useRef<UIMessage[] | null>(null);
  const pendingSendInputRef = useRef<string | null>(null);

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

  const sessionStartTime = useChatStore((s) => s.sessionStartTime);
  const setSessionStartTime = useChatStore((s) => s.setSessionStartTime);
  const incrementMessageCount = useChatStore((s) => s.incrementMessageCount);
  const addResponseTime = useChatStore((s) => s.addResponseTime);

  const transport = useMemo(() => createChatV2Transport<UIMessage>(), []);

  const reportChatError = useCallback(
    (errorBody: string) => {
      const normalizedError = errorBody.trim() || 'Unknown chat error';
      if (lastReportedErrorRef.current === normalizedError) return;
      lastReportedErrorRef.current = normalizedError;

      track('ai_chat_error', {
        chat_id: id,
        error: normalizedError,
      });
    },
    [id, track],
  );

  const {
    messages,
    setMessages,
    sendMessage,
    resumeStream,
    stop,
    status,
    clearError,
  } = useChat({
    id,
    transport,
    messages: initialMessages,
    generateId: () => crypto.randomUUID(),
    onFinish: ({ message, isAbort, isDisconnect, isError }) => {
      if (isAbort) return;

      void queryClient.invalidateQueries({
        queryKey: getHistoryQueryOptions().queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: getMessagesQueryOptions(id).queryKey,
      });

      if (isDisconnect) {
        console.debug('chat stream disconnected', { chatId: id });
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

      if (timing.totalMs) {
        addResponseTime(timing.totalMs);
      }
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
          'I’m still finishing a reply. I can only generate one response at a time, but I’ll be ready for your next message in a moment.',
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
          chat_id: id,
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

  const recoverFromServer = useCallback(async () => {
    try {
      const latestDesc = await getMessages({
        chatId: id,
        sort: 'desc',
        limit: DEFAULT_MESSAGES_PAGE_SIZE,
      });
      const latestAsc = latestDesc.slice().reverse();

      if (latestAsc.length === 0) {
        return { recovered: false, shouldReconnect: false } as const;
      }

      const lastServerMessage = latestAsc[latestAsc.length - 1];
      if (
        !hasAssistantContent(lastServerMessage) ||
        (lastServerMessage && hasInProgressParts(lastServerMessage))
      ) {
        return { recovered: false, shouldReconnect: false } as const;
      }

      setMessages((prev) => {
        const latestIds = new Set<string>();
        for (const message of latestAsc) {
          latestIds.add(message.id);
        }

        const merged: UIMessage[] = [];
        for (const message of prev) {
          if (latestIds.has(message.id)) continue;
          merged.push(message);
        }
        for (const message of latestAsc) {
          merged.push(message);
        }
        return merged;
      });
      queryClient.setQueryData(getMessagesQueryOptions(id).queryKey, latestAsc);

      setAssistantBusyMessage(null);
      setShowLoadErrorBanner(false);
      setShowReconnectBanner(false);
      clearError();

      return { recovered: true, shouldReconnect: false } as const;
    } catch (err) {
      console.warn('Failed to recover chat from server', err);
      return {
        recovered: false,
        shouldReconnect: isNetworkError(err),
      } as const;
    }
  }, [clearError, id, queryClient, setMessages]);

  const navigateToPersistedChat = useCallback(() => {
    return navigate({
      to: '/concierge/$id',
      params: { id },
      search: (prev) => ({ ...prev, defaultMessage: undefined }),
      replace: true,
      resetScroll: false,
    });
  }, [id, navigate]);

  const hasPersistedChatMessages = useCallback(async () => {
    try {
      const persistedMessages = await getMessages({
        chatId: id,
        sort: 'desc',
        limit: DEFAULT_MESSAGES_PAGE_SIZE,
        hideToast: true,
      });
      return persistedMessages.length > 0;
    } catch {
      return false;
    }
  }, [id]);

  const routeSyncStartedRef = useRef(false);
  const requestPersistedChatRouteSync = useCallback(async () => {
    if (hasIdParam) return false;
    if (routeSyncStartedRef.current) return false;
    routeSyncStartedRef.current = true;

    try {
      const ready = await hasPersistedChatMessages();
      if (!ready) {
        routeSyncStartedRef.current = false;
        return false;
      }

      await navigateToPersistedChat();
      return true;
    } catch {
      routeSyncStartedRef.current = false;
      return false;
    }
  }, [hasIdParam, hasPersistedChatMessages, navigateToPersistedChat]);

  const messagesRef = useRef(messages);
  const oldestMessageRef = useRef<UIMessage | undefined>(messages[0]);
  useEffect(() => {
    messagesRef.current = messages;
    oldestMessageRef.current = messages[0];
  }, [messages]);

  const resumeInFlightRef = useRef(false);
  const resumeStartedRef = useRef(false);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;

    if (!resumeInFlightRef.current) return;
    if (status === 'submitted' || status === 'streaming') {
      resumeStartedRef.current = true;
    }
  }, [status]);

  const attemptResumeStream = useCallback(
    async (options?: { force?: boolean }) => {
      if (resumeInFlightRef.current) return;
      const currentStatus = statusRef.current;
      if (currentStatus === 'submitted' || currentStatus === 'streaming')
        return;

      const current = messagesRef.current;
      const hasUser = hasUserMessages(current);
      const last = current[current.length - 1];

      const shouldResume =
        options?.force === true
          ? true
          : hasUser &&
            (last?.role === 'user' ||
              (last?.role === 'assistant' &&
                (hasInProgressParts(last) ||
                  getLastFinishStepReason(last) === 'tool-calls')));

      if (!shouldResume) return;

      const shouldPruneAssistant = last?.role === 'assistant';

      const snapshot = current;

      resumeInFlightRef.current = true;
      resumeStartedRef.current = false;

      setShowLoadErrorBanner(false);
      setShowReconnectBanner(false);
      clearError();

      if (shouldPruneAssistant) {
        setMessages((prev) => {
          const l = prev[prev.length - 1];
          return l?.role === 'assistant' ? prev.slice(0, -1) : prev;
        });
      }

      try {
        await resumeStream();
      } catch (err) {
        console.debug('resumeStream failed', err);
      }
      const started = resumeStartedRef.current;
      resumeInFlightRef.current = false;

      if (started) return;

      const recovery = await recoverFromServer();
      if (recovery.recovered) return;

      if (shouldPruneAssistant) {
        setMessages(snapshot);
      }

      if (recovery.shouldReconnect) {
        setShowLoadErrorBanner(false);
        setShowReconnectBanner(true);
        return;
      }

      setShowLoadErrorBanner(true);
      setShowReconnectBanner(false);
      reportChatError(
        'Recovery failed: assistant response was not available on the server.',
      );
    },
    [clearError, recoverFromServer, reportChatError, resumeStream, setMessages],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void attemptResumeStream();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [attemptResumeStream]);

  useEffect(() => {
    return () => {
      void stop().catch((err) => {
        console.debug('chat stop failed', err);
      });
    };
  }, [stop]);

  const handleReconnect = useCallback(() => {
    void attemptResumeStream({ force: true });
  }, [attemptResumeStream]);

  useEffect(() => {
    if (hasIdParam) return;
    if (!hasUserMessages(messages)) return;
    if (status !== 'streaming' && status !== 'ready') return;

    void requestPersistedChatRouteSync();
  }, [hasIdParam, messages, requestPersistedChatRouteSync, status]);

  useEffect(() => {
    if (hasIdParam) return;
    if (!hasUserMessages(messages)) return;
    if (status !== 'error') return;
    if (assistantBusyMessage != null) return;

    let cancelled = false;
    let timeoutId: number | null = null;
    let attempts = 0;

    const pollForPersistedChat = async () => {
      attempts += 1;

      const didSync = await requestPersistedChatRouteSync();
      if (cancelled) return;
      if (didSync) return;
      if (attempts >= 10) return;

      timeoutId = window.setTimeout(() => {
        void pollForPersistedChat();
      }, 500);
    };

    void pollForPersistedChat();

    return () => {
      cancelled = true;

      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [
    assistantBusyMessage,
    hasIdParam,
    id,
    messages,
    requestPersistedChatRouteSync,
    status,
  ]);

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
        chatId: id,
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
  }, [hasMoreOlder, id, isLoadingOlder, setMessages]);

  const onQueueSend = useCallback(
    (msg: { text: string; files: FileUIPart[] }) => {
      pendingSendSnapshotRef.current = messagesRef.current;
      pendingSendInputRef.current = msg.text.length > 0 ? msg.text : null;

      track('sent_message_ai', { message_length: msg.text.length });
      if (preset === 'import-memory') {
        track('import_memory_submitted', {
          chat_id: id,
          message_length: msg.text.length,
        });
      }
      lastReportedErrorRef.current = null;
      setShowLoadErrorBanner(false);
      setShowReconnectBanner(false);
      setAssistantBusyMessage(null);
      incrementMessageCount();

      sendMessage({
        ...(msg.text ? { text: msg.text } : {}),
        files: msg.files,
      });
    },
    [
      id,
      sendMessage,
      track,
      incrementMessageCount,
      setAssistantBusyMessage,
      preset,
    ],
  );

  const {
    queue,
    enqueue,
    remove: removeFromQueue,
  } = useMessageQueue({
    status,
    onSend: onQueueSend,
  });

  const handleSendMessage: typeof sendMessage = useCallback(
    (message, options) => {
      if (defaultMessage != null && defaultMessage.length > 0) {
        void navigate({
          search: (prev) => ({ ...prev, defaultMessage: undefined }),
          replace: true,
        });
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
            chat_id: id,
            message_length: messageLength,
          });
        }
        incrementMessageCount();
        return sendMessage(message, options);
      }

      const msg = message as { text?: string; files?: FileUIPart[] };
      enqueue({ text: msg.text ?? '', files: msg.files ?? [] });
      return Promise.resolve();
    },
    [
      defaultMessage,
      enqueue,
      id,
      incrementMessageCount,
      navigate,
      preset,
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

      const currentMessages = messagesRef.current;
      if (hasUserMessages(currentMessages)) return;

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

  useEffect(() => {
    if (sessionStartTime != null) return;
    setSessionStartTime(Date.now());
  }, [sessionStartTime, setSessionStartTime]);

  return {
    messages,
    setMessages,
    status,
    showLoadErrorBanner,
    showReconnectBanner,
    assistantBusyMessage,
    onReconnect: handleReconnect,
    input,
    setInput,
    attachments,
    setAttachments,
    sendMessage: handleSendMessage,
    hasMoreOlder,
    isLoadingOlder,
    onLoadOlder,
    ctxMessageId,
    preset,
    queue,
    removeFromQueue,
  };
}

interface ChatViewProps {
  chatId: string;
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  status: UseChatHelpers<UIMessage>['status'];
  showLoadErrorBanner: boolean;
  showReconnectBanner: boolean;
  assistantBusyMessage: string | null;
  onReconnect: () => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  attachments: Array<FileUIPart>;
  setAttachments: Dispatch<SetStateAction<Array<FileUIPart>>>;
  sendMessage: UseChatHelpers<UIMessage>['sendMessage'];
  hasMoreOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void | Promise<void>;
  ctxMessageId?: string;
  preset?: string;
  queue: QueuedMessage[];
  removeFromQueue: (id: string) => void;
}

function ChatView({
  chatId,
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
  ctxMessageId,
  preset,
  queue,
  removeFromQueue,
}: ChatViewProps) {
  const navigate = useNavigate({ from: '/concierge' });

  const isUploadLabsPreset = preset === 'upload-labs';
  const hasUserMessages = messages.some((m) => m.role === 'user');
  const showDropzone =
    isUploadLabsPreset && !hasUserMessages && attachments.length === 0;

  const { data: user } = useUser();
  const onboardingComplete = useOnboardingCircleStore(
    (s) => s.completedSources.size >= 4,
  );
  const showImportMemory = shouldShowImportMemory(user?.createdAt);

  const setupActions = useMemo(() => {
    const actions = [
      {
        title: 'Upload past labs',
        subtitle: 'See trends from your past labs.',
        imageSrc: '/concierge/lab-upload.webp',
        onClick: () => {
          void navigate({
            to: '/concierge',
            search: { preset: 'upload-labs' },
          });
        },
      },
    ];

    if (showImportMemory) {
      actions.push({
        title: 'Continue from another AI',
        subtitle: 'Import your conversations and deepen your health story.',
        imageSrc: '/concierge/other_llms.webp',
        onClick: () => {
          void navigate({
            to: '/concierge',
            search: { preset: 'import-memory' },
          });
        },
      });
    }

    return actions;
  }, [navigate, showImportMemory]);

  const showErrorUi =
    status === 'error' ||
    showLoadErrorBanner ||
    showReconnectBanner ||
    assistantBusyMessage != null;

  return (
    <div className="mx-auto flex size-full min-w-0 max-w-3xl flex-1 flex-col">
      <div
        className={cn(
          'flex flex-1 flex-col overflow-y-auto',
          messages.length > 0 ? 'justify-start' : 'justify-center',
        )}
      >
        <Messages
          chatId={chatId}
          messages={messages}
          setMessages={setMessages}
          status={status}
          hasMoreOlder={hasMoreOlder}
          isLoadingOlder={isLoadingOlder}
          onLoadOlder={onLoadOlder}
          ctxMessageId={ctxMessageId}
        />

        {messages.length === 0 && (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <Greeting />
            {preset === 'daily-brief' && <DailyBriefCard />}
            <div className="flex w-full">
              {onboardingComplete ? (
                <SuggestedActions
                  onSendSuggestion={(text) => {
                    void sendMessage({ text, files: [] }, undefined);
                  }}
                  setupActions={setupActions}
                />
              ) : (
                <OnboardingCircle />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 shrink-0">
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

        <form className="mx-auto w-full pb-2">
          <MultimodalInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            status={status}
            attachments={attachments}
            setAttachments={setAttachments}
            disableFileUpload={!isUploadLabsPreset}
            allowSendWithAttachmentsOnly={isUploadLabsPreset}
            showLabUploadDropzone={showDropzone}
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
