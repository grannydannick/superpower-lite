import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';

import { cn } from '@/lib/utils';

import { PreviewMessage, ThinkingMessage } from '../ai/message';

interface AssistantMessagesProps {
  chatId: string;
  status: UseChatHelpers<UIMessage>['status'];
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
}

export function AssistantMessages({
  chatId,
  status,
  messages,
  setMessages,
}: AssistantMessagesProps) {
  return (
    <div className={cn('relative flex min-h-0 flex-1')}>
      <div
        className={cn(
          'relative flex min-h-0 flex-1 min-w-0 flex-col gap-6 overflow-auto overscroll-contain overflow-x-hidden py-4',
          'scrollbar scrollbar-thumb-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:w-2',
        )}
        style={{
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 32px, rgba(0,0,0,1) calc(100% - 32px), rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 32px, rgba(0,0,0,1) calc(100% - 32px), rgba(0,0,0,0) 100%)',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          overflowX: 'hidden',
        }}
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className="transition-all duration-200 ease-in-out"
          >
            <PreviewMessage
              chatId={chatId}
              message={message}
              isLoading={
                status === 'streaming' && messages.length - 1 === index
              }
              setMessages={setMessages}
            />
          </div>
        ))}

        {status === 'submitted' &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && (
            <div className="pl-0.5">
              <ThinkingMessage />
            </div>
          )}
      </div>
    </div>
  );
}
