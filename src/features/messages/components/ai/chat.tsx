import { useChat } from '@ai-sdk/react';
import { useQueryClient } from '@tanstack/react-query';
import { DefaultChatTransport, FileUIPart, type UIMessage } from 'ai';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id,
    transport: new DefaultChatTransport({
      api: `${env.API_URL}/chat`,
      headers: () => {
        const activeLogin = getActiveLogin();
        const accessToken = activeLogin?.accessToken;

        return {
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        };
      },
      prepareSendMessagesRequest({ messages, id }) {
        return {
          body: {
            message: messages[messages.length - 1],
            id,
            _followup: false,
          },
          credentials: 'include',
        };
      },
    }),
    messages: initialMessages,
    experimental_throttle: 100,
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
    onError: (error) => {
      console.error(error);

      const safeMessage =
        typeof (error as any)?.message === 'string'
          ? (error as any).message
          : '';

      const isValidationError =
        error.name === 'AI_TypeValidationError' ||
        safeMessage.includes('Type validation failed') ||
        (safeMessage.includes('finish') &&
          safeMessage.includes('finishReason'));

      const isPublicError = publicErrors.some(
        (publicError) => publicError === error.message,
      );

      if (isValidationError) {
        console.warn(
          'AI SDK type validation error - likely due to unrecognized message type from backend:',
          {
            error: error.message,
            name: error.name,
            timestamp: new Date().toISOString(),
          },
        );

        // Don't show these validation errors to the user as they're internal SDK issues
        refetch();
        navigate(`/concierge/${id}`);

        return;
      }

      if (isPublicError) {
        toast(error.message);
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
      <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col h-full">
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
              <div
                className={cn(
                  'transition-all duration-500 ease-out flex w-full',
                  input &&
                    'opacity-0 blur-[2px] pointer-events-none -translate-y-4',
                )}
              >
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
        <div className="flex-shrink-0 sticky bottom-0">
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
