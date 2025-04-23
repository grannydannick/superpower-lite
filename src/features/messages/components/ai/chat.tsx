import { useChat } from '@ai-sdk/react';
import type { Attachment, Message } from 'ai';
import React, { useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { useHistory } from '@/features/messages/api/get-history';
import { Greeting } from '@/features/messages/components/ai/greeting';
import { ChatOptions } from '@/features/messages/components/chat-options';
import { CreateMessageForm } from '@/features/messages/components/create-message-form';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { cn, getActiveLogin } from '@/lib/utils';
import { generateUUID } from '@/utils/generate-uiud';

import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { refetch } = useHistory();
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
  } = useChat({
    id,
    body: { id },
    api: `${env.API_URL}/chat`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getActiveLogin()?.accessToken}`,
    },
    initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    onFinish: () => {
      refetch();
    },
    onError: (error) => {
      if (error.message === 'Too many requests, please try again later.') {
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

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  if (type === 'concierge') {
    return (
      <div className="mx-auto flex size-full min-w-0 max-w-[592px] flex-1 flex-col justify-center">
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
            handleSubmit={handleSubmit}
            status={status}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
          />
        </form>

        <p className="max-w-[560px] pb-2 text-[10px] text-zinc-400">
          Your Superpower AI Health Advocate is not intended to replace medical
          advice, and solely provided solely to offer suggestions and education.
          Always seek the advice of a licensed human healthcare provider for any
          medical questions and call 911 or go to the emergency room if you are
          experiencing an emergent medical issue.
        </p>
      </div>
    </>
  );
}
