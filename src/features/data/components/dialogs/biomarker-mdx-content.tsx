import { MDXProvider } from '@mdx-js/react';
import { ArrowUpRight } from 'lucide-react';

import { ErrorBoundary } from '@/components/errors/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { Body2, body2ClassName, H3, H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

import type { BiomarkerContent } from '../../api/get-data-biomarkers';

type NodeProps = { children?: React.ReactNode };

// Custom components available in biomarker MDX content
const components = {
  h1: ({ children }: NodeProps) => <H3 className="mb-2 mt-6">{children}</H3>,
  h2: ({ children }: NodeProps) => <H3 className="mb-2 mt-6">{children}</H3>,
  h3: ({ children }: NodeProps) => <H4 className="mb-2 mt-6">{children}</H4>,
  h4: ({ children }: NodeProps) => <H4 className="mb-2 mt-6">{children}</H4>,
  p: ({ children }: NodeProps) => (
    <Body2 className="mb-2 text-secondary">{children}</Body2>
  ),
  ul: ({ children }: NodeProps) => (
    <ul className="ml-1 space-y-1 [&>li]:relative [&>li]:flex [&>li]:items-start [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-1/2 [&>li]:before:size-1 [&>li]:before:shrink-0 [&>li]:before:-translate-y-1/2 [&>li]:before:rounded-full [&>li]:before:bg-zinc-300">
      {children}
    </ul>
  ),
  ol: ({ children }: NodeProps) => (
    <ol className="ml-1 space-y-1 [counter-reset:list-counter] [&>li]:flex [&>li]:items-start [&>li]:[counter-increment:list-counter] [&>li]:before:mr-2 [&>li]:before:text-sm [&>li]:before:font-medium [&>li]:before:text-zinc-500 [&>li]:before:[content:counter(list-counter)'.']">
      {children}
    </ol>
  ),
  li: ({ children }: NodeProps) => (
    <li className={cn(body2ClassName, 'text-secondary')}>{children}</li>
  ),
  strong: ({ children }: NodeProps) => (
    <strong className="font-semibold text-zinc-700">{children}</strong>
  ),
  em: ({ children }: NodeProps) => (
    <em className="italic text-zinc-600">{children}</em>
  ),
  a: ({ href, children }: NodeProps & { href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-secondary underline underline-offset-2 hover:text-zinc-700"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: NodeProps) => (
    <blockquote className="border-l-2 border-zinc-200 pl-4 text-secondary">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-zinc-100" />,
};

export function BiomarkerContentSkeleton() {
  return (
    <div className="flex flex-col gap-2 pb-8">
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-11/12 rounded-full" />
      <Skeleton className="h-4 w-3/4 rounded-full" />
    </div>
  );
}

function Citations({
  citations,
}: {
  citations: BiomarkerContent['citations'];
}) {
  if (citations.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {citations.map((citation) => (
        <li key={citation.url}>
          <a
            href={citation.url}
            rel="noreferrer"
            target="_blank"
            className="group text-sm text-secondary hover:underline"
          >
            {citation.label}
            <ArrowUpRight className="mb-0.5 ml-1.5 inline-block size-3.5 text-zinc-400 transition-all group-hover:mb-1 group-hover:ml-2" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function BiomarkerMdxContent({
  content,
}: {
  content: BiomarkerContent;
}) {
  const { ContentComponent, description, citations } = content;

  const descriptionFallback = description ? (
    <Body2 className="text-secondary">{description}</Body2>
  ) : null;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {ContentComponent ? (
        <ErrorBoundary fallback={descriptionFallback ?? <></>}>
          <MDXProvider components={components}>
            <article>
              <ContentComponent />
            </article>
          </MDXProvider>
        </ErrorBoundary>
      ) : (
        descriptionFallback
      )}
      <Citations citations={citations} />
    </div>
  );
}
