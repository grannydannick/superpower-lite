/**
 * Shared predicates for citation types that should only show inline markers.
 * Used by both getCitationTooltip and isInlineOnlyCitation.
 */
const INLINE_ONLY_CITATION_RULES: Array<{
  predicate: (s: string) => boolean;
  tooltip: (userName: string | undefined) => string;
}> = [
  {
    predicate: (s) => s.startsWith('fhir://Patient'),
    tooltip: (userName) => userName ?? 'Your profile',
  },
  {
    predicate: (s) => s.startsWith('chat://'),
    tooltip: () => 'Based on our previous conversations',
  },
  {
    predicate: (s) => s.startsWith('marketplace://search'),
    tooltip: () => 'Based on product search',
  },
  {
    // Both new and legacy format for QuestionnaireResponse
    predicate: (s) =>
      s.startsWith('fhir://QuestionnaireResponse') ||
      s.startsWith('fhir:QuestionnaireResponse'),
    tooltip: () => 'Based on your response',
  },
  {
    // Both new and legacy format for Patient search
    predicate: (s) =>
      !!s.match(/^fhir:\/?\/?Patient\/[^/]+\/(search-summary|no-results)$/),
    tooltip: () => 'Based on your health records',
  },
  {
    // FHIR types other than Observation (both formats)
    predicate: (s) =>
      (s.startsWith('fhir:') || s.startsWith('fhir://')) &&
      !s.match(/^fhir:\/?\/?Observation/),
    tooltip: () => 'Based on your health records',
  },
];

/**
 * Generate tooltip text for inline-only citations
 */
export function getCitationTooltip(
  source: string,
  userName: string | undefined,
): string | undefined {
  // Memory citations have special handling
  if (source.startsWith('memory://')) {
    const groupMatch = source.match(/memory:\/\/group_summary\/[^/]+\/(\w+)/i);
    return groupMatch
      ? `Based on ${groupMatch[1]} memory`
      : 'Based on your memory';
  }

  const matchedRule = INLINE_ONLY_CITATION_RULES.find(({ predicate }) =>
    predicate(source),
  );
  return matchedRule ? matchedRule.tooltip(userName) : undefined;
}

/**
 * Returns true for citation types that should only show inline markers
 * without rendering a card below the paragraph.
 */
export function isInlineOnlyCitation(source: string): boolean {
  if (source.startsWith('memory://')) {
    return true;
  }

  return INLINE_ONLY_CITATION_RULES.some(({ predicate }) => predicate(source));
}
