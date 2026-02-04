import type { CitationInfo } from '../types/message-parts';

/**
 * Regex to match markdown links: [text](url)
 * Captures: [1] = display text, [2] = URL
 */
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Citation URL schemes that we recognize
 */
const CITATION_SCHEMES = [
  'fhir://',
  'product://',
  'memory://',
  'chat://',
  'marketplace://',
];

/**
 * Check if a URL is a citation URL (uses one of our custom schemes)
 */
export function isCitationUrl(url: string): boolean {
  return CITATION_SCHEMES.some((scheme) => url.startsWith(scheme));
}

/**
 * Extract the citation key from a URL.
 * The key is used for deduplication.
 */
export function extractCitationKeyFromUrl(url: string): string {
  return `source:${url}`;
}

/**
 * Parse markdown text and extract all citation links.
 * Returns citation info for each unique citation URL found.
 *
 * @param text - The markdown text to parse
 * @param startNumber - The starting citation number (for continuation across parts)
 * @returns Object with citations map and array of citation keys found in order
 */
export function extractCitationsFromMarkdown(
  text: string,
  existingCitations: Map<string, CitationInfo>,
  startNumber: number,
): {
  citations: Map<string, CitationInfo>;
  citationKeys: string[];
  nextNumber: number;
} {
  const citations = new Map(existingCitations);
  const citationKeys: string[] = [];
  let nextNumber = startNumber;

  // Reset regex state
  MARKDOWN_LINK_REGEX.lastIndex = 0;

  let match;
  while ((match = MARKDOWN_LINK_REGEX.exec(text)) !== null) {
    const displayText = match[1];
    const url = match[2];

    if (!isCitationUrl(url)) {
      continue;
    }

    const key = extractCitationKeyFromUrl(url);
    citationKeys.push(key);

    if (!citations.has(key)) {
      citations.set(key, {
        number: nextNumber,
        source: url,
        title: displayText,
        citedText: '', // Not available in markdown links
      });
      nextNumber++;
    }
  }

  return { citations, citationKeys, nextNumber };
}

/**
 * Transform markdown text to replace citation links with citation markers.
 * Keeps the display text and adds a citation marker after it.
 *
 * Example:
 *   Input: "Your [Vitamin D](fhir://Observation/abc-123) is optimal."
 *   Output: "Your Vitamin D [[1]](#msg-citation-1) is optimal."
 *
 * @param text - The markdown text to transform
 * @param citations - Map of citation keys to CitationInfo
 * @param messageId - The message ID for generating marker links
 * @returns Transformed text with citation markers
 */
export function transformCitationLinksToMarkers(
  text: string,
  citations: Map<string, CitationInfo>,
  messageId: string,
): string {
  // Reset regex state
  MARKDOWN_LINK_REGEX.lastIndex = 0;

  return text.replace(MARKDOWN_LINK_REGEX, (fullMatch, displayText, url) => {
    if (!isCitationUrl(url)) {
      // Not a citation URL, keep as-is
      return fullMatch;
    }

    const key = extractCitationKeyFromUrl(url);
    const citation = citations.get(key);

    if (!citation) {
      // Citation not found, just return the display text
      return displayText;
    }

    // Return display text followed by citation marker
    return `${displayText} [[${citation.number}]](#${messageId}-citation-${citation.number})`;
  });
}
