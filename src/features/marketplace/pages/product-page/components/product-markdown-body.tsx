import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

import { Body2, body2ClassName, H3, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

const sanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href ?? []), 'tel', 'sms', 'mailto'],
  },
};

const components = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <H3 className="mb-2 mt-6">{children}</H3>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <H3 className="mb-2 mt-6">{children}</H3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <H4 className="mb-2 mt-6">{children}</H4>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <H4 className="mb-2 mt-6">{children}</H4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <Body2 className="mb-2 text-secondary">{children}</Body2>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="ml-1 space-y-1 [&>li]:relative [&>li]:flex [&>li]:items-start [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-1/2 [&>li]:before:size-1 [&>li]:before:shrink-0 [&>li]:before:-translate-y-1/2 [&>li]:before:rounded-full [&>li]:before:bg-zinc-300">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="ml-1 space-y-1 [counter-reset:list-counter] [&>li]:flex [&>li]:items-start [&>li]:[counter-increment:list-counter] [&>li]:before:mr-2 [&>li]:before:text-sm [&>li]:before:font-medium [&>li]:before:text-zinc-500 [&>li]:before:[content:counter(list-counter)'.']">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className={cn(body2ClassName, 'text-secondary')}>{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-zinc-700">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-zinc-600">{children}</em>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-secondary underline underline-offset-2 hover:text-zinc-700"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-zinc-200 pl-4 text-secondary">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-zinc-100" />,
};

/** Same markdown renderer as the marketplace product page (`ProductContent`). */
export function MarketplaceProductMarkdownBody({
  markdown,
  className,
  showDivider = true,
}: {
  markdown: string;
  className?: string;
  showDivider?: boolean;
}) {
  const trimmed = markdown.trim();
  if (trimmed.length === 0) return null;

  return (
    <>
      {showDivider === true && <div className="my-6 h-px w-full bg-zinc-200" />}
      <div className={cn('flex flex-col gap-2', className)}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          components={components}
        >
          {trimmed}
        </ReactMarkdown>
      </div>
    </>
  );
}
