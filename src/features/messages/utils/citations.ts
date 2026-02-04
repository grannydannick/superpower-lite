import type { JSONValue } from 'ai';

import type { CitationInfo } from '../types/message-parts';

/**
 * Extract a unique key from a citation object for deduplication
 */
export function extractCitationKey(
  c: Record<string, JSONValue>,
): string | null {
  if (typeof c.source === 'string' && c.source.length > 0) {
    return `source:${c.source}`;
  }
  if (typeof c.url === 'string' && c.url.length > 0) {
    return `url:${c.url}`;
  }
  if (typeof c.file_id === 'string' && c.file_id.length > 0) {
    return `file:${c.file_id}`;
  }
  // Invalid citation - no stable key
  return null;
}

/**
 * Extract the source string from a citation object
 */
export function extractCitationSource(c: Record<string, JSONValue>): string {
  if (typeof c.source === 'string') return c.source;
  if (typeof c.url === 'string') return c.url;
  if (typeof c.file_id === 'string') return `file:${c.file_id}`;
  if (typeof c.document_title === 'string') return c.document_title;
  return 'unknown-source';
}

/**
 * Extract the title from a citation object
 */
export function extractCitationTitle(c: Record<string, JSONValue>): string {
  if (typeof c.title === 'string' && c.title.length > 0) return c.title;
  if (typeof c.document_title === 'string' && c.document_title.length > 0)
    return c.document_title;
  return extractCitationSource(c);
}

/**
 * Build citation info from a raw citation object
 */
export function buildCitationInfo(
  c: Record<string, JSONValue>,
  number: number,
): CitationInfo {
  return {
    number,
    source: extractCitationSource(c),
    title: extractCitationTitle(c),
    citedText: typeof c.cited_text === 'string' ? c.cited_text : '',
  };
}

/**
 * Inject citation markers into text before trailing punctuation
 */
export function injectCitationMarkers(
  text: string,
  numbers: number[],
  messageId: string,
): string {
  if (numbers.length === 0) return text;

  const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
  const markers = uniqueNumbers
    .map((n) => `[[${n}]](#${messageId}-citation-${n})`)
    .join(' ');

  // Insert markers before trailing punctuation if the text ends with it
  const trailingMatch = text.match(/([.!?])\s*$/);
  if (trailingMatch && trailingMatch.index !== undefined) {
    const insertPos = trailingMatch.index;
    const before = text.slice(0, insertPos);
    const punct = trailingMatch[1];
    const after = text.slice(insertPos + 1);
    return `${before} ${markers}${punct}${after}`;
  }

  // No trailing punctuation, append at end (but before trailing whitespace)
  const trimmed = text.trimEnd();
  const trailing = text.slice(trimmed.length);
  return `${trimmed} ${markers}${trailing}`;
}
