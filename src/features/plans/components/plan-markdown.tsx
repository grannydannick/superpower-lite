import { Info } from 'lucide-react';
import React, { Fragment, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Body1, H1, H2, H3, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import { Citation } from '../utils/extract-citations';

interface PlanMarkdownProps {
  content: string;
  citations?: Citation[];
  boldVermillion?: boolean;
}

const CitationTooltip = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  // support mobile device touch to open tooltip
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen} delayDuration={75}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="mb-1 ml-0.5 inline-block size-4 cursor-help touch-manipulation select-none text-zinc-400 transition-all hover:text-zinc-600 active:text-zinc-600"
            aria-label="Show citation details"
            onClick={handleClick}
          >
            <Info className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs"
          collisionPadding={{
            right: 8,
            left: 8,
            top: 8,
            bottom: 8,
          }}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CitationText = ({
  children,
  citations,
}: {
  children: string;
  citations?: Citation[];
}) => {
  if (!citations || citations.length === 0) {
    return <span>{children}</span>;
  }

  const citationMap = new Map(citations.map((c) => [c.key, c.content]));
  const citationRegex = /\[\^(\d+)\]/g;
  const segments: React.ReactNode[] = [];
  let lastEnd = 0;
  let match;
  let keyIndex = 0;

  while ((match = citationRegex.exec(children)) !== null) {
    if (match.index > lastEnd) {
      segments.push(children.slice(lastEnd, match.index));
    }

    const citationKey = `[^${match[1]}]`;
    const citationContent = citationMap.get(citationKey);

    if (citationContent) {
      segments.push(
        <CitationTooltip key={keyIndex++} content={citationContent} />,
      );
    } else {
      segments.push(citationKey);
    }

    lastEnd = match.index + match[0].length;
  }

  if (lastEnd < children.length) {
    segments.push(children.slice(lastEnd));
  }

  return (
    <span>
      {segments.map((segment, i) => (
        <Fragment key={i}>{segment}</Fragment>
      ))}
    </span>
  );
};

export const PlanMarkdown = ({
  content,
  citations,
  boldVermillion,
}: PlanMarkdownProps) => {
  try {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => {
            return (
              <Body1 as="div" className="mb-4 break-words text-primary">
                {typeof props.children === 'string' ? (
                  <CitationText citations={citations}>
                    {props.children}
                  </CitationText>
                ) : Array.isArray(props.children) ? (
                  props.children.map((child, index) =>
                    typeof child === 'string' ? (
                      <CitationText key={index} citations={citations}>
                        {child}
                      </CitationText>
                    ) : (
                      child
                    ),
                  )
                ) : (
                  props.children
                )}
              </Body1>
            );
          },
          h1: (props) => <H1 className="mb-2 break-words" {...props} />,
          h2: (props) => <H2 className="mb-2 break-words" {...props} />,
          h3: (props) => <H3 className="mb-2 break-words" {...props} />,
          h4: (props) => <H4 className="mb-2 break-words" {...props} />,
          ul: (props) => (
            <ul
              className="relative z-10 mb-4 ml-3 list-outside list-disc space-y-1 font-sans text-base [&_li::marker]:text-zinc-300"
              {...props}
            />
          ),
          ol: (props) => (
            <ol
              className="mb-4 ml-5 list-decimal text-base text-primary [&_li:has(strong)::marker]:text-vermillion-900 [&_strong]:text-vermillion-900"
              {...props}
            />
          ),
          li: (props) => (
            <li className="mb-1 break-words font-sans text-primary">
              {typeof props.children === 'string' ? (
                <CitationText citations={citations}>
                  {props.children}
                </CitationText>
              ) : Array.isArray(props.children) ? (
                props.children.map((child, index) =>
                  typeof child === 'string' ? (
                    <CitationText key={index} citations={citations}>
                      {child}
                    </CitationText>
                  ) : (
                    child
                  ),
                )
              ) : (
                props.children
              )}
            </li>
          ),
          strong: (props) => (
            <strong
              className={cn(
                'break-words font-bold',
                boldVermillion && 'text-vermillion-900',
              )}
              {...props}
            />
          ),
          a: (props) => (
            <a
              className="break-all text-vermillion-900 hover:underline"
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {props.children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  } catch (error) {
    return (
      <Body1 className="whitespace-pre-line break-words text-zinc-500">
        {content}
      </Body1>
    );
  }
};
