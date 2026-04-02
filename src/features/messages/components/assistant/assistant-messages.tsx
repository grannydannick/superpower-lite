import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { useEffect, useRef } from 'react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bypass react-remove-scroll's wheel block when a Radix Dialog is open.
  // react-remove-scroll attaches a capture-phase listener on `document` that
  // calls preventDefault()+stopPropagation() for scroll events outside the
  // dialog portal. Because `window` fires before `document` in the capture
  // phase, we can intercept the event first and stop it from reaching the
  // scroll-lock handler, letting the browser scroll this container normally.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.contains(e.target as Node)) {
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener('wheel', onWheel, { capture: true });
    return () =>
      window.removeEventListener('wheel', onWheel, { capture: true });
  }, []);

  return (
    <div className={cn('relative flex min-h-0 flex-1')}>
      <div
        ref={scrollRef}
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
