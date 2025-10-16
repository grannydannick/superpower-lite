import { Info } from 'lucide-react';
import React, { useMemo, useState } from 'react';
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

const CitationHoverText = ({
  label,
  content,
}: {
  label: string;
  content: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => setIsOpen(!isOpen);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen} delayDuration={75}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="cursor-help touch-manipulation select-none text-secondary decoration-zinc-300 underline-offset-4 transition-all duration-150 hover:text-primary hover:underline hover:decoration-dotted"
            aria-label="Show citation details"
            onClick={handleClick}
          >
            {label}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs"
          collisionPadding={{ right: 8, left: 8, top: 8, bottom: 8 }}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const PlanMarkdown = ({
  content,
  citations,
  boldVermillion,
}: PlanMarkdownProps) => {
  // Sort citations by numeric key order (e.g., [^1], [^2])
  const sortedCitations = useMemo(() => {
    if (!citations || citations.length === 0) return [] as Citation[];
    return [...citations].sort((a, b) => {
      const na = parseInt(a.key.replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(b.key.replace(/\D/g, ''), 10) || 0;
      return na - nb;
    });
  }, [citations]);

  try {
    const sanitizedContent = sanitizeMarkdown(content);

    return (
      <div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: (props) => {
              return (
                <Body1 as="div" className="mb-4 break-words text-primary">
                  {props.children}
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
                {props.children}
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
          {sanitizedContent}
        </ReactMarkdown>

        {sortedCitations.length > 0 && (
          <Body1 as="div" className="mt-2 break-words text-secondary">
            <Info size={16} className="mb-1 mr-1.5 inline" />
            <span>Evidence & Research: </span>
            {sortedCitations.map((c, idx) => {
              const label = `Source ${idx + 1}`;
              return (
                <span key={c.key}>
                  <CitationHoverText label={label} content={c.content} />
                  {idx < sortedCitations.length - 1 ? ', ' : ''}
                </span>
              );
            })}
          </Body1>
        )}
      </div>
    );
  } catch (error) {
    return (
      <Body1 className="whitespace-pre-line break-words text-zinc-500">
        {content}
      </Body1>
    );
  }
};

function sanitizeMarkdown(input: string): string {
  // Remove em dashes
  // Makes it look really AI generated lol
  // Jacob request
  // Also remove inline citation markers like [^1], [^2]
  return input.replace(/\u2014/g, ' -- ').replace(/\[\^\d+\]/g, '');
}
