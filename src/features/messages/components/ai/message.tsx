import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import cx from 'classnames';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';

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
  setMessages: UseChatHelpers['setMessages'];
}) => {
  const [mode] = useState<'view' | 'edit'>('view');

  const renderIcon = () => {
    if (message.role !== 'assistant') return;

    return isLoading ? (
      <AnimatedIcon state="thinking" />
    ) : (
      <AIIcon fill="#A1A1AA" />
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="group/message mx-auto w-full max-w-3xl px-4"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {renderIcon()}

          <div className="flex w-full flex-col gap-2">
            {message.experimental_attachments &&
              message.experimental_attachments?.length > 0 && (
                <div className="flex flex-row justify-end gap-2">
                  {message.experimental_attachments.map((attachment) => (
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
                    <div key={key} className="flex flex-row items-center gap-2">
                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-4', {
                          'ml-auto rounded-2xl border border-zinc-100 bg-white px-3.5 py-2 text-black shadow-sm':
                            message.role === 'user',
                        })}
                      >
                        <Markdown>{part.text}</Markdown>
                      </div>
                    </div>
                  );
                }
              }
            })}

            <MessageActions
              key={`action-${message.id}`}
              chatId={chatId}
              message={message}
              isLoading={isLoading}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;

    return true;
  },
);

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
