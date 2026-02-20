import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, FileUIPart, type UIMessage } from 'ai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { useHistory } from '@/features/messages/api/get-history';
import {
  getMessages,
  getMessagesQueryOptions,
} from '@/features/messages/api/get-messages';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { extractTiming } from '@/features/messages/utils/extract-timing';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn, getActiveLogin } from '@/lib/utils';
import { generateUUID } from '@/utils/generate-uiud';

import { classifyChatError } from './chat-error-utils';
import { Greeting } from './greeting';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { SuggestedActions } from './suggested-actions';

const publicErrors = [
  'Too many requests, please try again later.',
  'This chat has ended. Please start a new chat.',
];
const conciergeLoadErrorMessage =
  'Currently chat is under heavy load. Please try again later.';

/** Check if an assistant message has actual text content */
const hasAssistantContent = (message: UIMessage | undefined): boolean => {
  if (!message || message.role !== 'assistant') return false;
  return (message.parts ?? []).some(
    (p) => p.type === 'text' && p.text && p.text.length > 0,
  );
};

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

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { refetch } = useHistory();
  const { track } = useAnalytics();
  const navigate = useNavigate();
  const lastReportedErrorRef = useRef<string | null>(null);

  const initialMessage = searchParams.get('defaultMessage');
  const [input, setInput] = useState(initialMessage ?? '');

  // Helper to get fresh access token and user ID for each request
  const getActiveLoginData = () => {
    const activeLogin = getActiveLogin();
    return {
      accessToken: activeLogin?.accessToken,
      userId: activeLogin?.profile?.userId,
    };
  };

  // Memoize transport to prevent unnecessary re-creation
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `${env.API_URL}/chat/chatv2`,
        credentials: 'include',
        headers: () => {
          // Get fresh token and user ID on each request
          const { accessToken } = getActiveLoginData();
          return {
            Accept: 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          };
        },
        prepareSendMessagesRequest: ({ id, messages }) => {
          // Find the last user message
          const lastUser = [...messages]
            .reverse()
            .find((m) => m.role === 'user');

          if (!lastUser) {
            throw new Error('No user message to send.');
          }

          return {
            api: `${env.API_URL}/chat/chatv2`,
            body: { id, message: lastUser },
          };
        },
        prepareReconnectToStreamRequest: ({ id }) => ({
          api: `${env.API_URL}/chat/chatv2/${id}/stream`,
        }),
      }),
    [], // Intentionally empty - uses fresh data via getActiveLoginData()
  );

  const recoveryInProgressRef = useRef(false);

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

  const recoverFromServer = useCallback(
    async (setMessages: (messages: UIMessage[]) => void) => {
      if (recoveryInProgressRef.current) {
        return {
          success: false as const,
          errorBody: 'Recovery already in progress.',
        };
      }
      recoveryInProgressRef.current = true;

      try {
        const serverMessages = await getMessages({ chatId: id });
        if (serverMessages && serverMessages.length > 0) {
          const lastMessage = serverMessages[serverMessages.length - 1];
          if (hasAssistantContent(lastMessage)) {
            setMessages(serverMessages);
            queryClient.setQueryData(
              getMessagesQueryOptions(id).queryKey,
              serverMessages,
            );
            recoveryInProgressRef.current = false;
            return { success: true as const, errorBody: null };
          }
        }
        recoveryInProgressRef.current = false;
        return {
          success: false as const,
          errorBody: 'Recovery failed: assistant response was empty.',
        };
      } catch (err) {
        const recoveryErrorMessage =
          err instanceof Error && err.message
            ? err.message
            : 'Recovery failed: unable to fetch messages.';

        recoveryInProgressRef.current = false;
        return {
          success: false as const,
          errorBody: recoveryErrorMessage,
        };
      }
    },
    [id, queryClient],
  );

  const { messages, setMessages, sendMessage, resumeStream, status } = useChat({
    id,
    transport,
    messages: initialMessages,
    generateId: generateUUID,
    onFinish: ({ message }) => {
      refetch();

      // make sure that the chat message cache is fresh here
      // e.g. so that navigating away and back shows the latest messages.
      queryClient.invalidateQueries({ queryKey: ['chat', id] });

      if (message.role === 'user') {
        const messageLength = message.parts?.reduce((acc, part) => {
          if (part.type === 'text') {
            acc += part.text.length;
          }
          return acc;
        }, 0);

        track('sent_message_ai', {
          message_length: messageLength ?? 0,
        });
      } else if (message.role === 'assistant') {
        const timing = extractTiming(message, false);

        track('received_message_ai', {
          response_time: timing.totalMs,
        });

        if (timing.totalMs) {
          addResponseTime(timing.totalMs);
        }
      }
    },
    onError: (err) => {
      const safeMessage = getErrorMessage(err);
      const safeName = getErrorName(err);
      const errorBody = getErrorBody(err);
      const errorKind = classifyChatError({
        errorName: safeName,
        errorMessage: safeMessage,
        publicErrors,
      });

      if (errorKind === 'validation') {
        setShowLoadErrorBanner(false);
        track('ai_sdk_validation_error', {
          error_message: safeMessage,
          error_name: safeName,
          chat_id: id,
        });

        // Don't show these validation errors to the user as they're internal SDK issues
        refetch();
        navigate(`/concierge/${id}`);

        return;
      }

      if (errorKind === 'public') {
        setShowLoadErrorBanner(false);
        toast(safeMessage);
        return;
      }

      setShowLoadErrorBanner(true);
      reportChatError(errorBody);

      // Fall back to server-side message recovery after a delay
      setTimeout(() => recoverFromServer(setMessages), 1000);
    },
  });

  // Resume stream on page load for existing chats.
  // Always attempt for non-new chats with messages — if no stream is active,
  // the SDK gracefully handles it as a no-op.
  const resumeAttemptedRef = useRef(false);
  useEffect(() => {
    if (resumeAttemptedRef.current) return;
    if (initialMessages.length === 0) return;
    if (status !== 'ready') return;

    resumeAttemptedRef.current = true;
    resumeStream().catch(() => {});
  }, [initialMessages.length, resumeStream, status]);

  // Safety net: detect "ready but empty assistant" state and attempt recovery.
  // Catches edge cases where onFinish might not fire or status transitions unexpectedly.
  const recoveryAttemptedRef = useRef(false);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const [showLoadErrorBanner, setShowLoadErrorBanner] = useState(false);

  useEffect(() => {
    if (status !== 'ready') {
      recoveryAttemptedRef.current = false;
      setRecoveryFailed(false);
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const needsRecovery =
      messages.length > 0 &&
      (lastMessage?.role === 'user' ||
        (lastMessage?.role === 'assistant' &&
          !hasAssistantContent(lastMessage)));

    if (needsRecovery && !recoveryAttemptedRef.current) {
      recoveryAttemptedRef.current = true;

      recoverFromServer(setMessages).then((result) => {
        if (!result.success) {
          setRecoveryFailed(true);
          setShowLoadErrorBanner(true);
          reportChatError(
            result.errorBody ?? 'Recovery failed: unknown chat error.',
          );
        }
      });
    }
  }, [status, messages, recoverFromServer, setMessages, reportChatError]);

  // Treat recovery failure as error so UI shows retry option
  const effectiveStatus =
    recoveryFailed && status === 'ready' ? 'error' : status;

  // Sync messages to React Query cache when message count changes.
  // This ensures navigating away mid-stream and returning gets the latest
  // messages (including the user's sent message), so resumeStream() works correctly.
  // IMPORTANT: Exclude the partial streaming assistant message from cache.
  // The server's reconnect endpoint replays the full stream, so caching
  // partial content would cause duplicates when resumeStream() runs.
  const lastSyncedCountRef = useRef(0);

  useEffect(() => {
    if (messages.length === 0 || messages.length === lastSyncedCountRef.current)
      return;
    lastSyncedCountRef.current = messages.length;

    // Exclude partial streaming assistant response — resumeStream replays
    // the full stream, so caching partial content causes duplicates.
    const lastMsg = messages[messages.length - 1];
    const isPartialAssistant =
      lastMsg?.role === 'assistant' && status !== 'ready';
    const messagesToCache = isPartialAssistant
      ? messages.slice(0, -1)
      : messages;

    queryClient.setQueryData(
      getMessagesQueryOptions(id).queryKey,
      messagesToCache,
    );
  }, [messages.length, messages, id, queryClient, status]);

  const sessionStartTime = useChatStore((s) => s.sessionStartTime);
  const setSessionStartTime = useChatStore((s) => s.setSessionStartTime);
  const incrementMessageCount = useChatStore((s) => s.incrementMessageCount);
  const addResponseTime = useChatStore((s) => s.addResponseTime);

  const [attachments, setAttachments] = useState<Array<FileUIPart>>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSendMessage = (message: any, options: any) => {
    if (searchParams.get('defaultMessage') != null) {
      setSearchParams(
        (params) => {
          params.delete('defaultMessage');
          return params;
        },
        { replace: true },
      );
    }
    lastReportedErrorRef.current = null;
    setRecoveryFailed(false);
    setShowLoadErrorBanner(false);
    incrementMessageCount();
    setInput('');
    return sendMessage(message, options);
  };

  useEffect(() => {
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
  }, [sessionStartTime, setSessionStartTime]);

  return (
    <>
      <div className="mx-auto flex size-full min-w-0 max-w-3xl flex-1 flex-col">
        {/* Scrollable content area */}
        <div
          className={cn(
            'flex flex-1 flex-col overflow-y-auto',
            messages.length > 0 ? 'justify-start' : 'justify-center',
          )}
        >
          <Messages
            chatId={id}
            messages={messages}
            setMessages={setMessages}
            status={effectiveStatus}
          />

          {messages.length === 0 && (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              <Greeting />
              <div className="flex w-full">
                <SuggestedActions
                  onSendSuggestion={(text) =>
                    handleSendMessage({ text, files: [] }, undefined)
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky bottom area */}
        <div className="sticky bottom-0 shrink-0">
          {effectiveStatus === 'error' && showLoadErrorBanner && (
            <div className="mx-auto mb-3 w-full max-w-3xl px-1">
              <Alert variant="destructive">
                <AlertTitle>Concierge is experiencing high demand</AlertTitle>
                <AlertDescription>{conciergeLoadErrorMessage}</AlertDescription>
              </Alert>
            </div>
          )}

          <form className="mx-auto w-full pb-2">
            <MultimodalInput
              input={input}
              setInput={setInput}
              sendMessage={handleSendMessage}
              status={effectiveStatus}
              attachments={attachments}
              setAttachments={setAttachments}
              disableFileUpload
            />
          </form>

          <p className="mx-auto max-w-xl pb-2 text-center text-[10px] text-zinc-400">
            Your Superpower AI is not intended to replace medical advice, and
            solely provided solely to offer suggestions and education. Always
            seek the advice of a licensed human healthcare provider for any
            medical questions and call 911 or go to the emergency room if you
            are experiencing an emergent medical issue.
          </p>
        </div>
      </div>
    </>
  );
}
