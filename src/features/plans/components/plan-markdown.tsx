import { Info } from 'lucide-react';
import React, { Fragment } from 'react';
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
        <TooltipProvider key={keyIndex++}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="mb-1 ml-0.5 inline-block size-4 cursor-help text-zinc-400 transition-all hover:text-zinc-600" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>{citationContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
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
