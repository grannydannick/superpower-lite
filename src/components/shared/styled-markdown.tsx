import ReactMarkdown from 'react-markdown';

import { Body1 } from '@/components/ui/typography';

export const StyledMarkdown = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <Body1 className="text-zinc-500">{children}</Body1>
          ),
          ul: ({ children }) => (
            <ul className="ml-1 space-y-1 [&>li]:relative [&>li]:flex [&>li]:items-start [&>li]:pl-4 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-1/2 [&>li]:before:size-1 [&>li]:before:shrink-0 [&>li]:before:-translate-y-1/2 [&>li]:before:rounded-full [&>li]:before:bg-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-1 space-y-1 [counter-reset:list-counter] [&>li]:flex [&>li]:items-start [&>li]:[counter-increment:list-counter] [&>li]:before:mr-2 [&>li]:before:text-sm [&>li]:before:font-medium [&>li]:before:text-zinc-500 [&>li]:before:[content:counter(list-counter)'.']">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li>
              <Body1 className="text-zinc-500">{children}</Body1>
            </li>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
