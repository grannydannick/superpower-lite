import { Link, Text } from '@react-pdf/renderer';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderMarkdownToPdf } from './markdown-to-pdf';
import { FONT_FAMILY_MONO } from './pdf-fonts';

type PdfTestElement = React.ReactElement<{
  children?: React.ReactNode;
  src?: string;
  style?: unknown;
}>;

function collectElements(node: React.ReactNode): PdfTestElement[] {
  if (node == null || typeof node === 'boolean') return [];
  if (Array.isArray(node)) return node.flatMap(collectElements);
  if (!React.isValidElement(node)) return [];

  const element = node as PdfTestElement;

  return [element, ...collectElements(element.props.children)];
}

function collectText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (!React.isValidElement(node)) return '';

  return collectText((node as PdfTestElement).props.children);
}

describe('renderMarkdownToPdf', () => {
  it('returns null for empty markdown', () => {
    expect(renderMarkdownToPdf('')).toBeNull();
  });

  it('renders unordered lists with bullet markers', () => {
    const elements = renderMarkdownToPdf('- Item one\n- Item two');
    const textContent = collectElements(elements)
      .filter((element) => element.type === Text)
      .map((element) => collectText(element.props.children));

    expect(textContent).toContain('\u2022  ');
    expect(textContent).toContain('Item one');
    expect(textContent).toContain('Item two');
  });

  it('preserves ordered list start numbers', () => {
    const elements = renderMarkdownToPdf('3. Third\n4. Fourth');
    const textContent = collectElements(elements)
      .filter((element) => element.type === Text)
      .map((element) => collectText(element.props.children));

    expect(textContent).toContain('3. ');
    expect(textContent).toContain('4. ');
  });

  it('renders code blocks with monospace text styling', () => {
    const elements = renderMarkdownToPdf('```ts\nconst value = 1;\n```');
    const codeText = collectElements(elements).find(
      (element) =>
        element.type === Text &&
        collectText(element.props.children) === 'const value = 1;',
    );

    expect(codeText).toBeDefined();
    expect(codeText?.props.style).toMatchObject({
      fontFamily: FONT_FAMILY_MONO,
    });
  });

  it('only renders safe markdown links as clickable links', () => {
    const elements = renderMarkdownToPdf(
      '[unsafe](javascript:alert(1)) and [safe](https://example.com)',
    );
    const links = collectElements(elements).filter(
      (element) => element.type === Link,
    );

    expect(links).toHaveLength(1);
    expect(links[0]?.props.src).toBe('https://example.com');
    expect(collectText(elements)).toContain('unsafe and safe');
  });
});
