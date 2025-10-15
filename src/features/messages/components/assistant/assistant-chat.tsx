import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, FileUIPart } from 'ai';
import { useState } from 'react';

import { env } from '@/config/env';
import { useHistory } from '@/features/messages/api/get-history';
import { MultimodalInput } from '@/features/messages/components/ai/multimodal-input';
import { AssistantMessages } from '@/features/messages/components/assistant/assistant-messages';
import { useAnalytics } from '@/hooks/use-analytics';
import { cn, getActiveLogin } from '@/lib/utils';
import { generateUUID } from '@/utils/generate-uiud';

export function AssistantChat({ chatId }: { chatId: string }) {
  const { refetch } = useHistory();
  const { track } = useAnalytics();

  const [id] = useState<string>(chatId);

  const [lastUserMessageTime, setLastUserMessageTime] = useState<number | null>(
    null,
  );
  const [lastSentMessageTime, setLastSentMessageTime] = useState<number | null>(
    null,
  );
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Array<FileUIPart>>([]);

  const transportHeaders: Record<string, string> = {
    Accept: 'application/json',
  };
  const accessToken = getActiveLogin()?.accessToken;
  if (accessToken) {
    transportHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id,
    transport: new DefaultChatTransport({
      api: `${env.API_URL}/chat`,
      headers: transportHeaders,
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          credentials: 'include',
        }),
    }),
    messages: [],
    experimental_throttle: 100,
    generateId: generateUUID,
    onFinish: ({ message }) => {
      refetch();

      if (message.role === 'user') {
        const currentTime = Date.now();
        setLastSentMessageTime(currentTime);

        const messageLength = message.parts?.reduce((acc, part) => {
          if (part.type === 'text') acc += part.text.length;
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

      const responseTime = lastUserMessageTime
        ? Date.now() - lastUserMessageTime
        : null;

      if (responseTime) {
        // Optional: could persist lightweight stats, skipping for mini chat
      }
    },
  });

  return (
    <div
      className={cn('flex h-full w-full flex-col justify-end overflow-hidden')}
    >
      <div className="mx-auto flex min-h-0 w-full min-w-0 flex-1 flex-col pr-1">
        <AssistantMessages
          chatId={id}
          messages={messages}
          setMessages={setMessages}
          status={status}
        />
      </div>
      <div className="pt-2">
        <form
          className={cn(
            'mx-auto flex w-full flex-col gap-6 pb-2',
            messages.length > 0 ? 'mt-auto' : null,
          )}
        >
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            sendMessage={(message, options) => {
              setLastUserMessageTime(Date.now());
              setInput('');
              return sendMessage(message, options);
            }}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            showSuggestions={false}
            className="min-h-12 rounded-xl bg-zinc-100 shadow-none"
          />
        </form>
      </div>
    </div>
  );
}
