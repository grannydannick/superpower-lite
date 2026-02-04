import { UseChatHelpers } from '@ai-sdk/react';
import { UIMessage } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { InfoIcon } from 'lucide-react';
import React, { memo, useMemo, useState } from 'react';
import { Streamdown } from 'streamdown';

import { AIIcon } from '@/components/icons/ai-icon';
import { Link } from '@/components/ui/link';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

const LOADING_MESSAGES = [
  'Evaluating health profile...',
  'Analyzing latest results...',
] as const;

import type { CitationInfo } from '../../types/message-parts';
import { getCitationTooltip } from '../../utils/citation-tooltip';
import { parseMessageParts } from '../../utils/parse-message-parts';

import { CitationCards, CitationMarker } from './citations';
import { CodeBlock } from './code-block';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';

// ============================================================================
// Markdown Components
// ============================================================================

type MarkdownComponentProps = {
  children?: React.ReactNode;
  [key: string]: unknown;
};

interface MarkdownComponentsOptions {
  messageId: string;
  citations: Map<string, CitationInfo>;
  userName?: string;
}

const createMarkdownComponents = ({
  messageId,
  citations,
  userName,
}: MarkdownComponentsOptions) => ({
  code: ({
    inline,
    className,
    children,
    ...props
  }: MarkdownComponentProps & { inline?: boolean; className?: string }) => {
    return CodeBlock({
      inline: inline || false,
      className: className || '',
      children,
      ...props,
    });
  },
  pre: ({ children }: Pick<MarkdownComponentProps, 'children'>) => (
    <>{children}</>
  ),
  ol: ({ children, ...props }: MarkdownComponentProps) => (
    <ol className="ml-4 list-outside list-decimal" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: MarkdownComponentProps) => (
    <li className="py-1" {...props}>
      {children}
    </li>
  ),
  ul: ({ children, ...props }: MarkdownComponentProps) => (
    <ul className="ml-4 list-outside list-disc" {...props}>
      {children}
    </ul>
  ),
  strong: ({ children, ...props }: MarkdownComponentProps) => (
    <span className="font-semibold" {...props}>
      {children}
    </span>
  ),
  a: ({
    children,
    href,
    ...props
  }: MarkdownComponentProps & { href?: string }) => {
    const text = String(children);

    // Check if this is a citation marker link (e.g. [[1]](#msg-citation-1))
    const citationMatch = text.match(/^\[(\d+)\]$/);
    if (citationMatch && citationMatch[1] && href?.includes('-citation-')) {
      const num = parseInt(citationMatch[1], 10);
      // Find citation by number to get tooltip
      const citation = Array.from(citations.values()).find(
        (c) => c.number === num,
      );
      const tooltip = citation
        ? getCitationTooltip(citation.source, userName)
        : undefined;
      return (
        <CitationMarker messageId={messageId} number={num} tooltip={tooltip} />
      );
    }

    // Not a valid link - render as plain text (handles [blocked] etc.)
    if (!href || (!href.startsWith('http') && !href.startsWith('#'))) {
      return <>{children}</>;
    }

    return (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        to={href}
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ children, ...props }: MarkdownComponentProps) => (
    <h1 className="mb-2 mt-6 text-3xl font-semibold" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: MarkdownComponentProps) => (
    <h2 className="mb-2 mt-6 text-2xl font-semibold" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: MarkdownComponentProps) => (
    <h3 className="mb-2 mt-6 text-xl font-semibold" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: MarkdownComponentProps) => (
    <h4 className="mb-2 mt-6 text-lg font-semibold" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: MarkdownComponentProps) => (
    <h5 className="mb-2 mt-6 text-base font-semibold" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: MarkdownComponentProps) => (
    <h6 className="mb-2 mt-6 text-sm font-semibold" {...props}>
      {children}
    </h6>
  ),
  table: ({ children, ...props }: MarkdownComponentProps) => (
    <table className="w-full border-collapse bg-transparent text-sm" {...props}>
      {children}
    </table>
  ),
  thead: ({ children, ...props }: MarkdownComponentProps) => (
    <thead className="border-b border-zinc-300" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: MarkdownComponentProps) => (
    <tbody {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }: MarkdownComponentProps) => (
    <tr
      className="border-b border-zinc-200 last:border-b-0 [thead_&]:border-b-0"
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }: MarkdownComponentProps) => (
    <th
      className="pb-4 pr-8 text-left first:pl-0 last:pr-0"
      style={{ fontWeight: 700 }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: MarkdownComponentProps) => (
    <td className="py-5 pr-8 align-top first:pl-0 last:pr-0" {...props}>
      {children}
    </td>
  ),
});

// ============================================================================
// User Message Component
// ============================================================================

interface UserMessageContentProps {
  message: UIMessage;
}

const UserMessageContent = memo(function UserMessageContent({
  message,
}: UserMessageContentProps) {
  const text = message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');

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
      <div className="flex flex-row items-center gap-2">
        <div
          data-testid="message-content"
          className="ml-auto rounded-2xl border border-zinc-200 bg-white px-3.5 py-2 text-black shadow-sm"
        >
          <div className="whitespace-pre-wrap">{text}</div>
        </div>
      </div>
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
  const userName = useMemo(() => {
    if (!user?.firstName) return undefined;
    return user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName;
  }, [user?.firstName, user?.lastName]);

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
          <Streamdown components={markdownComponents}>
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

  const renderIcon = () => {
    if (message.role !== 'assistant') return null;

    return isLoading ? (
      <AnimatedIcon state="thinking" className="mt-1" />
    ) : (
      <AIIcon fill="#A1A1AA" className="mt-1" />
    );
  };

  const isEmptyMessage =
    !message.parts?.length ||
    (message.parts.length === 1 && message.parts[0].type === 'step-start');

  return (
    <AnimatePresence>
      <motion.div
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
          {renderIcon()}

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
      </motion.div>
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
      className={cx(
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
