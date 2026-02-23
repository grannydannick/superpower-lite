import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { DefaultChatTransport, FileUIPart, type UIMessage } from 'ai';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

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
  const controller = useConciergeChatController({ id, initialMessages });

  return (
    <ChatView
      chatId={id}
      messages={controller.messages}
      setMessages={controller.setMessages}
      effectiveStatus={controller.effectiveStatus}
      showLoadErrorBanner={controller.showLoadErrorBanner}
      input={controller.input}
      setInput={controller.setInput}
      attachments={controller.attachments}
      setAttachments={controller.setAttachments}
      sendMessage={controller.sendMessage}
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
  const queryClient = useQueryClient();
  const { refetch } = useHistory();
  const { track } = useAnalytics();
  const navigate = useNavigate({ from: '/concierge' });

  const lastReportedErrorRef = useRef<string | null>(null);
  const recoveryInProgressRef = useRef(false);
  const resumeAttemptedRef = useRef(false);
  const recoveryAttemptedRef = useRef(false);
  const lastSyncedCountRef = useRef(0);

  const [input, setInput] = useState(defaultMessage ?? '');
  const [attachments, setAttachments] = useState<Array<FileUIPart>>([]);
  const [recoveryFailed, setRecoveryFailed] = useState(false);
  const [showLoadErrorBanner, setShowLoadErrorBanner] = useState(false);

  const sessionStartTime = useChatStore((s) => s.sessionStartTime);
  const setSessionStartTime = useChatStore((s) => s.setSessionStartTime);
  const incrementMessageCount = useChatStore((s) => s.incrementMessageCount);
  const addResponseTime = useChatStore((s) => s.addResponseTime);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `${env.API_URL}/chat/chatv2`,
        credentials: 'include',
        headers: () => {
          const accessToken = getActiveLogin()?.accessToken;
          return {
            Accept: 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          };
        },
        prepareSendMessagesRequest: ({ id, messages }) => {
          let lastUser: UIMessage | undefined;
          for (let i = messages.length - 1; i >= 0; i = i - 1) {
            const m = messages[i];
            if (m.role === 'user') {
              lastUser = m;
              break;
            }
          }

          if (!lastUser) throw new Error('No user message to send.');

          return {
            api: `${env.API_URL}/chat/chatv2`,
            body: { id, message: lastUser },
          };
        },
        prepareReconnectToStreamRequest: ({ id }) => ({
          api: `${env.API_URL}/chat/chatv2/${id}/stream`,
        }),
      }),
    [], // Intentionally empty - reads fresh token inside headers()
  );

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
        if (!serverMessages) {
          recoveryInProgressRef.current = false;
          return {
            success: false as const,
            errorBody: 'Recovery failed: assistant response was empty.',
          };
        }

        if (serverMessages.length === 0) {
          recoveryInProgressRef.current = false;
          return {
            success: false as const,
            errorBody: 'Recovery failed: assistant response was empty.',
          };
        }

        const lastMessage = serverMessages[serverMessages.length - 1];
        if (!hasAssistantContent(lastMessage)) {
          recoveryInProgressRef.current = false;
          return {
            success: false as const,
            errorBody: 'Recovery failed: assistant response was empty.',
          };
        }

        setMessages(serverMessages);
        queryClient.setQueryData(
          getMessagesQueryOptions(id).queryKey,
          serverMessages,
        );
        recoveryInProgressRef.current = false;
        return { success: true as const, errorBody: null };
      } catch (err) {
        let recoveryErrorMessage = 'Recovery failed: unable to fetch messages.';
        if (err instanceof Error) {
          if (err.message) {
            recoveryErrorMessage = err.message;
          }
        }

        recoveryInProgressRef.current = false;
        return {
          success: false as const,
          errorBody: recoveryErrorMessage,
        };
      }
    },
    [id, queryClient],
  );

  const clearRecoveryFailed = useCallback(() => {
    setRecoveryFailed(false);
  }, []);

  const markRecoveryFailed = useCallback(
    (errorBody: string | null | undefined) => {
      setRecoveryFailed(true);
      setShowLoadErrorBanner(true);
      reportChatError(errorBody ?? 'Recovery failed: unknown chat error.');
    },
    [reportChatError],
  );

  const { messages, setMessages, sendMessage, resumeStream, status } = useChat({
    id,
    transport,
    messages: initialMessages,
    generateId: () => crypto.randomUUID(),
    onFinish: ({ message }) => {
      refetch();

      // make sure that the chat message cache is fresh here
      // e.g. so that navigating away and back shows the latest messages.
      queryClient.invalidateQueries({ queryKey: ['chat', id] });

      if (message.role === 'user') {
        let messageLength = 0;
        for (const part of message.parts ?? []) {
          if (part.type === 'text') {
            messageLength += part.text.length;
          }
        }

        track('sent_message_ai', { message_length: messageLength });
        return;
      }

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
        void navigate({ to: '/concierge/$id', params: { id } });

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

  useEffect(() => {
    if (resumeAttemptedRef.current) return;
    if (initialMessages.length === 0) return;
    if (status !== 'ready') return;

    resumeAttemptedRef.current = true;
    resumeStream().catch(() => {});
  }, [initialMessages.length, resumeStream, status]);

  useEffect(() => {
    if (status !== 'ready') {
      recoveryAttemptedRef.current = false;
      const timeoutId = setTimeout(() => {
        clearRecoveryFailed();
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
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
          markRecoveryFailed(result.errorBody);
        }
      });
    }
  }, [
    status,
    messages,
    recoverFromServer,
    setMessages,
    clearRecoveryFailed,
    markRecoveryFailed,
  ]);

  const effectiveStatus =
    recoveryFailed && status === 'ready' ? 'error' : status;

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

  const handleSendMessage: typeof sendMessage = useCallback(
    (message, options) => {
      if (defaultMessage != null && defaultMessage.length > 0) {
        void navigate({
          search: (prev) => {
            return {
              ...prev,
              defaultMessage: undefined,
            };
          },
          replace: true,
        });
      }

      lastReportedErrorRef.current = null;
      setRecoveryFailed(false);
      setShowLoadErrorBanner(false);
      incrementMessageCount();
      setInput('');
      return sendMessage(message, options);
    },
    [defaultMessage, incrementMessageCount, navigate, sendMessage],
  );

  useEffect(() => {
    if (sessionStartTime != null) return;

    const timeoutId = setTimeout(() => {
      setSessionStartTime(Date.now());
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [sessionStartTime, setSessionStartTime]);

  return {
    messages,
    setMessages,
    effectiveStatus,
    showLoadErrorBanner,
    input,
    setInput,
    attachments,
    setAttachments,
    sendMessage: handleSendMessage,
  };
}

interface ChatViewProps {
  chatId: string;
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  effectiveStatus: UseChatHelpers<UIMessage>['status'];
  showLoadErrorBanner: boolean;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  attachments: Array<FileUIPart>;
  setAttachments: Dispatch<SetStateAction<Array<FileUIPart>>>;
  sendMessage: UseChatHelpers<UIMessage>['sendMessage'];
}

function ChatView({
  chatId,
  messages,
  setMessages,
  effectiveStatus,
  showLoadErrorBanner,
  input,
  setInput,
  attachments,
  setAttachments,
  sendMessage,
}: ChatViewProps) {
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
          status={effectiveStatus}
        />

        {messages.length === 0 && (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <Greeting />
            <div className="flex w-full">
              <SuggestedActions
                onSendSuggestion={(text) =>
                  sendMessage({ text, files: [] }, undefined)
                }
              />
            </div>
          </div>
        )}
      </div>

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
            sendMessage={sendMessage}
            status={effectiveStatus}
            attachments={attachments}
            setAttachments={setAttachments}
            disableFileUpload
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
