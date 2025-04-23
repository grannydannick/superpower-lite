import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';

import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { cn } from '@/lib/utils';

import { PreviewMessage, ThinkingMessage } from './message';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers['status'];
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      className={cn(
        'relative max-h-full overflow-hidden',
        messages.length === 0 && 'hidden md:block',
      )}
    >
      <div className="pointer-events-none absolute top-0 z-10 h-8 w-full bg-gradient-to-t from-transparent to-zinc-50" />
      <div className="pointer-events-none absolute bottom-0 z-10 h-8 w-full bg-gradient-to-b from-transparent to-zinc-50" />
      <div
        ref={messagesContainerRef}
        className="relative flex max-h-[calc(100vh-20.5rem)] min-h-32 min-w-0 flex-col gap-6 overflow-y-scroll py-4 md:max-h-full lg:pb-0"
      >
        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={status === 'streaming' && messages.length - 1 === index}
            setMessages={setMessages}
          />
        ))}

        {status === 'submitted' &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

        <div
          ref={messagesEndRef}
          className="min-h-[24px] min-w-[24px] shrink-0"
        />
      </div>
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
