import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';

import { AIIcon } from '@/components/icons/ai-icon';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { cn } from '@/lib/utils';

import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
}: {
  chatId: string;
  message: UIMessage;
  isLoading: boolean;
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
}) => {
  const [mode] = useState<'view' | 'edit'>('view');

  const renderIcon = () => {
    if (message.role !== 'assistant') return;

    return isLoading ? (
      <AnimatedIcon state="thinking" className="mt-1" />
    ) : (
      <AIIcon fill="#A1A1AA" className="mt-1" />
    );
  };

  const isEmptyMessage =
    !message.parts?.length ||
    (message.parts.length === 1 && message.parts[0].type === 'step-start');

  const fileParts = message.parts?.filter((part) => part.type === 'file');

  return (
    <AnimatePresence>
      <motion.div
        className="group/message mx-auto w-full max-w-3xl px-0.5"
        initial={{ y: 5, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        layout="position"
        layoutId={message.id}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex w-full gap-4 transition-all duration-100 ease-in-out group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-full': mode !== 'edit',
            },
          )}
        >
          {renderIcon()}

          <div className="flex w-full flex-col gap-2">
            {fileParts && fileParts?.length > 0 && (
              <div className="flex shrink-0 flex-row items-center gap-2 overflow-x-scroll px-4 pt-2 duration-500 animate-in fade-in scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] hover:scrollbar-thumb-zinc-400">
                {fileParts.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div
                      key={key}
                      className={cn('flex flex-row items-center gap-2', {
                        'animate-ai-streaming': isLoading,
                      })}
                    >
                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-4', {
                          'ml-auto rounded-2xl border border-zinc-200 bg-white px-3.5 py-2 text-black shadow-sm':
                            message.role === 'user',
                        })}
                      >
                        <div
                          style={{
                            animationDelay: isLoading
                              ? `${index * 0.25}s`
                              : '0s',
                          }}
                          className={cn(
                            'flex flex-col gap-4 [&_*:nth-child(1)]:mt-0',
                            isLoading && '[&>*]:animate-ai-streaming',
                          )}
                        >
                          <Markdown>{part.text}</Markdown>
                        </div>
                      </div>
                    </div>
                  );
                }
              }
            })}

            {
              // In some cases the API is overloaded and returns an empty message.
              isEmptyMessage && !isLoading && message.role === 'assistant' && (
                <OverloadedMessage />
              )
            }

            {!isEmptyMessage && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = PurePreviewMessage;

// FIXME(Kenta): memoization condition is incorrect causing unfired rerenders
//  when text is streamed in. To be fixed.
//  See https://github.com/superpowerdotcom/superpower-app/pull/719
// export const PreviewMessage = memo(
//   PurePreviewMessage,
//   (prevProps, nextProps) => {
//     if (prevProps.isLoading !== nextProps.isLoading) return false;
//     if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

//     return true;
//   },
// );

export const ThinkingMessage = () => {
  return (
    <div
      className={cx(
        'flex w-full gap-4 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2',
        {
          'group-data-[role=user]/message:bg-muted': true,
        },
      )}
    >
      <AnimatedIcon state="thinking" />
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-col gap-4 text-muted-foreground">
          Thinking...
        </div>
      </div>
    </div>
  );
};

const OverloadedMessage = () => {
  return (
    <div className="mt-1 flex flex-row items-center gap-2">
      <div
        data-testid="message-content"
        className="flex items-center gap-4 rounded-xl border border-destructive/10 bg-destructive/10 p-4"
      >
        <InfoIcon className="size-5 text-destructive" />
        <p className="text-balance text-destructive">
          I am sorry, but I am currently overloaded. Please try again in a
          moment.
        </p>
      </div>
    </div>
  );
};
