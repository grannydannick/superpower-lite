import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';

import { cn } from '@/lib/utils';

import { PreviewMessage, ThinkingMessage } from '../ai/message';

interface AssistantMessagesProps {
  chatId: string;
  status: UseChatHelpers<UIMessage>['status'];
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  disableLayoutAnimation?: boolean;
}

export function AssistantMessages({
  chatId,
  status,
  messages,
  setMessages,
  disableLayoutAnimation = false,
}: AssistantMessagesProps) {
  return (
    <div className={cn('relative flex min-h-0 flex-1')}>
      <div
        className={cn(
          'relative flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-auto overflow-x-auto overscroll-contain py-4',
          'scrollbar scrollbar-thumb-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2',
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
        }}
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              'ease-in-out',
              disableLayoutAnimation ? '' : 'transition-all duration-200',
            )}
          >
            <PreviewMessage
              chatId={chatId}
              message={message}
              isLoading={
                status === 'streaming' && messages.length - 1 === index
              }
              setMessages={setMessages}
              disableLayoutAnimation={disableLayoutAnimation}
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
