import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import { AnimatePresence, m } from 'framer-motion';
import { InfoIcon } from 'lucide-react';
import React, { memo, useMemo, useState } from 'react';
import rehypeSanitize from 'rehype-sanitize';
import { defaultRehypePlugins, Streamdown } from 'streamdown';

import { AIIcon } from '@/components/icons/ai-icon';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import { sanitizeSchema } from '../../utils/markdown-sanitize-schema';
import { parseMessageParts } from '../../utils/parse-message-parts';

import { CitationCards } from './citations';
import { createMarkdownComponents } from './markdown-components';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';

const LOADING_MESSAGES = [
  'Evaluating health profile...',
  'Analyzing latest results...',
] as const;

const rehypePlugins = [
  defaultRehypePlugins.raw,
  [rehypeSanitize, sanitizeSchema],
  // Note: intentionally omitting rehype-harden as it blocks custom protocol links
  // (fhir://, product://, etc.) - sanitization above handles security
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any;

// ============================================================================
// User Message Component
// ============================================================================

interface UserMessageContentProps {
  message: UIMessage;
}

const UserMessageContent = memo(function UserMessageContent({
  message,
}: UserMessageContentProps) {
  const messageParts = message.parts ?? [];
  const text = messageParts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');

  const fileParts = messageParts.filter((part) => part.type === 'file');
  const hasText = text.trim().length > 0;

  return (
    <>
      {fileParts && fileParts.length > 0 && (
        <div className="flex shrink-0 flex-row items-center gap-2 overflow-x-scroll px-4 pt-2 duration-500 animate-in fade-in scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] hover:scrollbar-thumb-zinc-400">
          {fileParts.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}
        </div>
      )}
      {hasText && (
        <div className="flex flex-row items-center gap-2">
          <div
            data-testid="message-content"
            className="ml-auto rounded-2xl border border-zinc-200 bg-white px-3.5 py-2 text-black shadow-sm"
          >
            <div className="whitespace-pre-wrap">{text}</div>
          </div>
        </div>
      )}
    </>
  );
});

// ============================================================================
// Assistant Message Component
// ============================================================================

interface AssistantMessageContentProps {
  message: UIMessage;
  isStreaming: boolean;
}

const AssistantMessageContent = memo(function AssistantMessageContent({
  message,
  isStreaming,
}: AssistantMessageContentProps) {
  const { data: user } = useUser();
  // Random loading message - stable per message
  const [loadingMessage] = useState(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
  );

  const { blocks, citations } = useMemo(
    () => parseMessageParts(message, isStreaming),
    [message, isStreaming],
  );

  // Build user's full name for FHIR Patient citation tooltips
  const firstName = user?.firstName;
  const lastName = user?.lastName;
  const userName = useMemo(() => {
    if (firstName == null || firstName.length === 0) return undefined;
    if (lastName == null || lastName.length === 0) return firstName;
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  // Show loading message when streaming but no content yet
  const showLoadingMessage = isStreaming && blocks.length === 0;

  // Track which paragraph first introduces each citation
  const firstParagraphForCitation = useMemo(() => {
    const map = new Map<string, number>();
    let paragraphIndex = 0;
    for (const block of blocks) {
      if (block.kind !== 'paragraph') continue;
      for (const key of block.citationKeys ?? []) {
        if (!map.has(key)) {
          map.set(key, paragraphIndex);
        }
      }
      paragraphIndex += 1;
    }
    return map;
  }, [blocks]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownComponents = useMemo(
    () =>
      createMarkdownComponents({
        messageId: message.id,
        citations,
        userName,
      }) as any,
    [message.id, citations, userName],
  );

  const rendered = useMemo(() => {
    const result: React.ReactNode[] = [];
    let paragraphIndex = 0;

    for (const block of blocks) {
      if (block.kind === 'node') {
        result.push(
          <React.Fragment key={block.key}>{block.node}</React.Fragment>,
        );
        continue;
      }

      // Paragraph block - render with Streamdown
      const textToRender = block.text ?? '';

      result.push(
        <div key={block.key} className="leading-relaxed">
          <Streamdown
            components={markdownComponents}
            rehypePlugins={rehypePlugins}
          >
            {textToRender}
          </Streamdown>
        </div>,
      );

      // Add citation cards after the first paragraph that introduces them
      if (block.done) {
        const cardsToShow = (block.citationKeys ?? [])
          .filter(
            (key) => firstParagraphForCitation.get(key) === paragraphIndex,
          )
          .map((key) => citations.get(key))
          .filter(
            (info): info is NonNullable<typeof info> => info !== undefined,
          )
          .sort((a, b) => a.number - b.number);

        if (cardsToShow.length > 0) {
          result.push(
            <CitationCards
              key={`${block.key}:citations`}
              messageId={message.id}
              blockKey={block.key}
              citations={cardsToShow}
            />,
          );
        }
      }

      paragraphIndex += 1;
    }

    return result;
  }, [
    blocks,
    citations,
    firstParagraphForCitation,
    message.id,
    markdownComponents,
  ]);

  // Handle file attachments from the message
  const fileParts = message.parts?.filter((part) => part.type === 'file');

  return (
    <>
      {fileParts && fileParts.length > 0 && (
        <div className="flex shrink-0 flex-row items-center gap-2 overflow-x-scroll px-4 pt-2 duration-500 animate-in fade-in scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300 [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent)] hover:scrollbar-thumb-zinc-400">
          {fileParts.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}
        </div>
      )}
      {showLoadingMessage ? (
        <div className="py-1">
          <TextShimmer className="font-medium">{loadingMessage}</TextShimmer>
        </div>
      ) : (
        <div className="flex flex-col gap-4 [&_*:nth-child(1)]:mt-0">
          {rendered}
        </div>
      )}
    </>
  );
});

// ============================================================================
// Preview Message Component
// ============================================================================

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  disableLayoutAnimation = false,
}: {
  chatId: string;
  message: UIMessage;
  isLoading: boolean;
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  disableLayoutAnimation?: boolean;
}) => {
  const [mode] = useState<'view' | 'edit'>('view');

  const icon =
    message.role !== 'assistant' ? null : isLoading ? (
      <AnimatedIcon state="thinking" className="mt-1" />
    ) : (
      <AIIcon fill="#A1A1AA" className="mt-1" />
    );

  const isEmptyMessage =
    !message.parts?.length ||
    (message.parts.length === 1 && message.parts[0].type === 'step-start');

  return (
    <AnimatePresence>
      <m.div
        id={`message-${message.id}`}
        className="group/message mx-auto w-full max-w-3xl px-0.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: disableLayoutAnimation ? 0 : 0.3,
          ease: 'easeOut',
        }}
        layout={disableLayoutAnimation ? false : 'position'}
        layoutId={message.id}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex w-full gap-2 transition-all duration-100 ease-in-out group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-full': mode !== 'edit',
            },
          )}
        >
          {icon}

          <div className="flex w-full flex-col gap-2">
            {mode === 'view' && (
              <>
                {message.role === 'user' ? (
                  <UserMessageContent message={message} />
                ) : (
                  <AssistantMessageContent
                    message={message}
                    isStreaming={isLoading}
                  />
                )}
              </>
            )}

            {isEmptyMessage && !isLoading && message.role === 'assistant' && (
              <OverloadedMessage />
            )}

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
      </m.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = PurePreviewMessage;

// ============================================================================
// Thinking Message Component
// ============================================================================

export const ThinkingMessage = () => {
  return (
    <div
      className={cn(
        'flex w-full gap-2 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2',
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

// ============================================================================
// Overloaded Message Component
// ============================================================================

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
