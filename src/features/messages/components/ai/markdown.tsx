import React, { memo, type ReactNode } from 'react';
import { Streamdown } from 'streamdown';

import { Link } from '@/components/ui/link';

import { CodeBlock } from './code-block';

type ComponentProps = {
  children?: ReactNode;
  [key: string]: any;
};

const components = {
  code: ({
    inline,
    className,
    children,
    ...props
  }: ComponentProps & { inline?: boolean; className?: string }) => {
    return CodeBlock({
      inline: inline || false,
      className: className || '',
      children,
      ...props,
    });
  },
  pre: ({ children }: Pick<ComponentProps, 'children'>) => <>{children}</>,
  ol: ({ children, ...props }: ComponentProps) => {
    return (
      <ol className="ml-4 list-outside list-decimal" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ children, ...props }: ComponentProps) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ children, ...props }: ComponentProps) => {
    return (
      <ul className="ml-4 list-outside list-disc" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ children, ...props }: ComponentProps) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ children, href, ...props }: ComponentProps & { href?: string }) => {
    if (!href) return null;

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
  h1: ({ children, ...props }: ComponentProps) => {
    return (
      <h1 className="mb-2 mt-6 text-3xl font-semibold" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }: ComponentProps) => {
    return (
      <h2 className="mb-2 mt-6 text-2xl font-semibold" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: ComponentProps) => {
    return (
      <h3 className="mb-2 mt-6 text-xl font-semibold" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }: ComponentProps) => {
    return (
      <h4 className="mb-2 mt-6 text-lg font-semibold" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ children, ...props }: ComponentProps) => {
    return (
      <h5 className="mb-2 mt-6 text-base font-semibold" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ children, ...props }: ComponentProps) => {
    return (
      <h6 className="mb-2 mt-6 text-sm font-semibold" {...props}>
        {children}
      </h6>
    );
  },
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return <Streamdown components={components}>{children}</Streamdown>;
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
