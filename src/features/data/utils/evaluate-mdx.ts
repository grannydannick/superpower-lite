import { evaluate } from '@mdx-js/mdx';
import { useMDXComponents } from '@mdx-js/react';
import * as runtime from 'react/jsx-runtime';

export type MdxModule = { default: React.ComponentType };

export const evaluateMdx = (source: string): Promise<MdxModule> =>
  evaluate(source, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(runtime as any),
    useMDXComponents,
    baseUrl: import.meta.url,
  }) as Promise<MdxModule>;
