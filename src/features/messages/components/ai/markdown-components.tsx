import { Check, Copy } from 'lucide-react';
import type { ReactNode } from 'react';

import { Link } from '@/components/ui/link';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import type { CitationInfo } from '../../types/message-parts';
import { getCitationTooltip } from '../../utils/citation-tooltip';

import { CitationMarker } from './citations';
import { CodeBlock } from './code-block';

type MarkdownComponentProps = {
  children?: ReactNode;
  [key: string]: unknown;
};

// ============================================================================
// Link Component
// ============================================================================

const EXTERNAL_PROTOCOL = /^(https?:|mailto:|tel:|sms:)/;

interface MarkdownLinkProps {
  children?: ReactNode;
  href?: string;
  citationContext?: {
    messageId: string;
    citations: Map<string, CitationInfo>;
    userName?: string;
  };
}

function MarkdownLink({ children, href, citationContext }: MarkdownLinkProps) {
  const text = String(children);
  const isCitationLink = href?.includes('-citation-') && /^\[\d+\]$/.test(text);

  // Citation marker with context - render interactive marker
  if (isCitationLink && citationContext) {
    const num = parseInt(text.slice(1, -1), 10);
    const citation = Array.from(citationContext.citations.values()).find(
      (c) => c.number === num,
    );
    return (
      <CitationMarker
        messageId={citationContext.messageId}
        number={num}
        tooltip={
          citation
            ? getCitationTooltip(citation.source, citationContext.userName)
            : undefined
        }
      />
    );
  }

  // Citation marker without context (e.g. share dialog) - render inline text
  if (isCitationLink) {
    return <sup className="text-blue-500">{text}</sup>;
  }

  // No href - render nothing
  if (!href) return null;

  // External protocols (http, https, mailto, tel, sms) - use native <a>
  if (EXTERNAL_PROTOCOL.test(href)) {
    const needsNewTab = href.startsWith('http');
    return (
      <a
        className="text-vermillion-900 hover:underline"
        href={href}
        {...(needsNewTab && { target: '_blank', rel: 'noreferrer' })}
      >
        {children}
      </a>
    );
  }

  // Anchor links - use native <a>
  if (href.startsWith('#')) {
    return (
      <a className="text-blue-500 hover:underline" href={href}>
        {children}
      </a>
    );
  }

  // Copy protocol - render as a copy-to-clipboard button
  if (href.startsWith('copy://')) {
    let text: string;
    try {
      text = decodeURIComponent(href.slice(7));
    } catch (e) {
      console.error('Unable to decode URI for copy protocol:', e);
      text = href.slice(7);
    }
    return <CopyButton text={text}>{children}</CopyButton>;
  }

  // Unknown protocol (fhir://, product://, etc.) - render as plain text
  if (!href.startsWith('/')) {
    return <>{children}</>;
  }

  // Internal app links - use React Router
  return (
    <Link className="text-blue-500 hover:underline" to={href}>
      {children}
    </Link>
  );
}

// ============================================================================
// Copy Button Component
// ============================================================================

interface CopyButtonProps {
  text: string;
  children?: ReactNode;
}

function CopyButton({ text, children }: CopyButtonProps) {
  const { copied, copyToClipboard } = useCopyToClipboard(text, {
    resetDelay: 1500,
  });

  return (
    <span className="relative my-2 block rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
      <span className="block max-h-36 overflow-y-auto p-4 pb-10 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="whitespace-pre-wrap">{text}</span>
      </span>
      <button
        onClick={copyToClipboard}
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied!' : children}
      </button>
    </span>
  );
}

// ============================================================================
// Shared Components
// ============================================================================

const sharedComponents = {
  code: ({
    inline,
    className,
    children,
    ...props
  }: MarkdownComponentProps & { inline?: boolean; className?: string }) =>
    CodeBlock({
      inline: inline || false,
      className: className || '',
      children,
      ...props,
    }),

  pre: ({ children }: Pick<MarkdownComponentProps, 'children'>) => (
    <>{children}</>
  ),

  ol: ({ children, ...props }: MarkdownComponentProps) => (
    <ol className="ml-4 list-outside list-decimal" {...props}>
      {children}
    </ol>
  ),

  ul: ({ children, ...props }: MarkdownComponentProps) => (
    <ul className="ml-4 list-outside list-disc" {...props}>
      {children}
    </ul>
  ),

  li: ({ children, ...props }: MarkdownComponentProps) => (
    <li className="py-1" {...props}>
      {children}
    </li>
  ),

  strong: ({ children, ...props }: MarkdownComponentProps) => (
    <span className="font-semibold" {...props}>
      {children}
    </span>
  ),

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
};

// ============================================================================
// Exports
// ============================================================================

/**
 * Base markdown components without citation handling.
 */
export const baseMarkdownComponents = {
  ...sharedComponents,
  a: ({ children, href }: MarkdownComponentProps & { href?: string }) => (
    <MarkdownLink href={href}>{children}</MarkdownLink>
  ),
};

interface CreateMarkdownComponentsOptions {
  messageId: string;
  citations: Map<string, CitationInfo>;
  userName?: string;
}

/**
 * Creates markdown components with citation-aware link handling.
 */
export const createMarkdownComponents = ({
  messageId,
  citations,
  userName,
}: CreateMarkdownComponentsOptions) => ({
  ...sharedComponents,
  a: ({ children, href }: MarkdownComponentProps & { href?: string }) => (
    <MarkdownLink
      href={href}
      citationContext={{ messageId, citations, userName }}
    >
      {children}
    </MarkdownLink>
  ),
});
