import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, FileUIPart, type UIMessage } from 'ai';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { toast } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { useHistory } from '@/features/messages/api/get-history';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn, getActiveLogin } from '@/lib/utils';
import { generateUUID } from '@/utils/generate-uiud';

import { Greeting } from './greeting';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { SuggestedActions } from './suggested-actions';

const publicErrors = [
  'Too many requests, please try again later.',
  'This chat has ended. Please start a new chat.',
];

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

  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(
    null,
  );
  const [lastSentMessageTime, setLastSentMessageTime] = useState<number | null>(
    null,
  );

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

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id,
    transport,
    messages: initialMessages,
    resume: true, // Enable auto-resume for durable streams
    generateId: generateUUID,
    onFinish: ({ message }) => {
      refetch();

      // make sure that the chat message cache is fresh here
      // e.g. so that navigating away and back shows the latest messages.
      queryClient.invalidateQueries({ queryKey: ['chat', id] });

      // Track AI message events
      if (message.role === 'user') {
        const currentTime = Date.now();
        setLastSentMessageTime(currentTime);

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
        const responseTime = lastSentMessageTime
          ? Date.now() - lastSentMessageTime
          : null;

        track('received_message_ai', {
          response_time: responseTime,
        });
      }

      // Calculate response time
      const responseTime = lastUserMessageTime
        ? Date.now() - lastUserMessageTime
        : null;

      // Track response time for average calculation
      if (responseTime) {
        addResponseTime(responseTime);
      }
    },
    onError: (err) => {
      console.error(err);

      const safeMessage =
        typeof (err as Error & { message?: string })?.message === 'string'
          ? (err as Error).message
          : '';

      const isValidationError =
        err.name === 'AI_TypeValidationError' ||
        safeMessage.includes('Type validation failed') ||
        (safeMessage.includes('finish') &&
          safeMessage.includes('finishReason'));

      const isPublicError = publicErrors.some(
        (publicError) => publicError === err.message,
      );

      if (isValidationError) {
        console.warn(
          'AI SDK type validation error - likely due to unrecognized message type from backend:',
          {
            error: err.message,
            name: err.name,
            timestamp: new Date().toISOString(),
          },
        );

        // Don't show these validation errors to the user as they're internal SDK issues
        refetch();
        navigate(`/concierge/${id}`);

        return;
      }

      if (isPublicError) {
        toast(err.message);
      } else {
        // refetch to trigger api client if its non requests issue
        // for example if its dead access token issue it would refresh the token
        // this is hack
        refetch();
      }
    },
  });

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
    setLastUserMessageTime(Date.now());
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
            status={status}
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
          <form className="mx-auto w-full pb-2">
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              sendMessage={handleSendMessage}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
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
