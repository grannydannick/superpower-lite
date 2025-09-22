import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { useHistory } from '../../api/get-history';

import { PreviewMessage, ThinkingMessage } from './message';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<UIMessage>['status'];
  messages: UseChatHelpers<UIMessage>['messages'];
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
}: MessagesProps) {
  const { data: history } = useHistory();
  const navigate = useNavigate();
  const { id } = useParams();

  // If the chat is ready and there are messages, navigate to the chat
  useEffect(() => {
    if (status === 'ready' && messages.length > 0 && !id) {
      const recentChat = history?.find((h) => h.id === chatId);
      if (recentChat) {
        navigate(`/concierge/${recentChat.id}`);
      }
    }
  }, [status, messages, history, chatId, navigate, id]);

  return (
    <div
      className={cn(
        'relative max-h-full overflow-hidden transition-all duration-200 ease-in-out',
        messages.length === 0 && 'block h-0',
      )}
    >
      <div className="pointer-events-none absolute top-0 z-10 h-8 w-full bg-gradient-to-t from-transparent to-zinc-50" />
      <div className="pointer-events-none absolute bottom-0 z-10 h-8 w-full bg-gradient-to-b from-transparent to-zinc-50" />
      <div className="relative flex max-h-[calc(100vh-20.5rem)] min-h-32 min-w-0 flex-col gap-6 overflow-y-scroll py-4 transition-all duration-200 ease-in-out md:max-h-full lg:pb-0">
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
            <div className="pl-4 transition-all duration-200 ease-in-out">
              <ThinkingMessage />
            </div>
          )}

        <div className="min-h-[24px] min-w-[24px] shrink-0" />
      </div>
    </div>
  );
}

export const Messages = PureMessages;

// FIXME(Kenta): memoization condition is incorrect causing unfired rerenders
//  when text is streamed in. To be fixed.
//  See https://github.com/superpowerdotcom/superpower-app/pull/719
// export const Messages = memo(PureMessages, (prevProps, nextProps) => {
//   if (prevProps.status !== nextProps.status) return false;
//   if (prevProps.status && nextProps.status) return false;
//   if (prevProps.messages.length !== nextProps.messages.length) return false;
//   if (!equal(prevProps.messages, nextProps.messages)) return false;

//   return true;
// });
