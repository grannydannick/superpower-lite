import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, FileUIPart, type UIMessage } from 'ai';
import { useEffect, useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { useHistory } from '@/features/messages/api/get-history';
import { Greeting } from '@/features/messages/components/ai/greeting';
import { ChatOptions } from '@/features/messages/components/chat-options';
import { CreateMessageForm } from '@/features/messages/components/create-message-form';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn, getActiveLogin } from '@/lib/utils';
import { generateUUID } from '@/utils/generate-uiud';

import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

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
  const { refetch } = useHistory();
  const { track } = useAnalytics();

  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(
    null,
  );
  const [lastSentMessageTime, setLastSentMessageTime] = useState<number | null>(
    null,
  );
  const [input, setInput] = useState('');
  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id,
    transport: new DefaultChatTransport({
      api: `${env.API_URL}/chat`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getActiveLogin()?.accessToken}`,
      },
    }),
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    onFinish: ({ message }) => {
      refetch();

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
      if (publicErrors.some((publicError) => publicError === error.message)) {
        toast(error.message);
      } else {
        // refetch to trigger api client if its non requests issue
        // for example if its dead access token issue it would refresh the token
        // this is hack
        refetch();
      }
    },
  });
  const type = useChatStore((s) => s.type);
  const sessionStartTime = useChatStore((s) => s.sessionStartTime);
  const setSessionStartTime = useChatStore((s) => s.setSessionStartTime);
  const incrementMessageCount = useChatStore((s) => s.incrementMessageCount);
  const addResponseTime = useChatStore((s) => s.addResponseTime);

  const [attachments, setAttachments] = useState<Array<FileUIPart>>([]);

  // Initialize session start time when component mounts for AI chat
  useEffect(() => {
    if (type === 'ai' && !sessionStartTime) {
      setSessionStartTime(Date.now());
    }
  }, [type, sessionStartTime, setSessionStartTime]);

  if (type === 'concierge') {
    return (
      <div className="mx-auto flex size-full min-w-0 max-w-[592px] flex-1 flex-col justify-center pb-[50px]">
        <div className="mx-auto flex w-full flex-col gap-6 pb-2">
          <Greeting />
          <ChatOptions />
          <CreateMessageForm />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'mx-auto flex w-full min-w-0 max-w-[592px] flex-1 flex-col',
          messages.length > 0 ? 'justify-start' : 'justify-between',
        )}
      >
        <Messages
          chatId={id}
          messages={messages}
          setMessages={setMessages}
          status={status}
        />

        <form
          className={cn(
            'mx-auto flex w-full flex-col gap-6 pb-2',
            messages.length > 0 ? 'mt-auto' : null,
          )}
        >
          {messages.length === 0 && <Greeting />}
          {messages.length === 0 && <ChatOptions />}
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            sendMessage={(message, options) => {
              setLastUserMessageTime(Date.now());
              incrementMessageCount();
              setInput('');
              return sendMessage(message, options);
            }}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
          />
        </form>

        <p className="max-w-[560px] pb-2 text-[10px] text-zinc-400">
          Your Superpower AI is not intended to replace medical advice, and
          solely provided solely to offer suggestions and education. Always seek
          the advice of a licensed human healthcare provider for any medical
          questions and call 911 or go to the emergency room if you are
          experiencing an emergent medical issue.
        </p>
      </div>
    </>
  );
}
