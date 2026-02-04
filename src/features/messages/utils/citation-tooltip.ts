/**
 * Generate tooltip text for inline-only citations
 */
export function getCitationTooltip(
  source: string,
  userName: string | undefined,
): string | undefined {
  if (source.startsWith('memory://')) {
    const groupMatch = source.match(/memory:\/\/group_summary\/[^/]+\/(\w+)/i);
    return groupMatch
      ? `Based on ${groupMatch[1]} memory`
      : 'Based on your memory';
  }

  const tooltipRules: Array<[(s: string) => boolean, () => string]> = [
    [(s) => s.startsWith('fhir://Patient'), () => userName ?? 'Your profile'],
    [
      (s) => s.startsWith('chat://'),
      () => 'Based on our previous conversations',
    ],
    [
      (s) => s.startsWith('marketplace://search'),
      () => 'Based on product search',
    ],
    [
      // Both new and legacy format for QuestionnaireResponse
      (s) =>
        s.startsWith('fhir://QuestionnaireResponse') ||
        s.startsWith('fhir:QuestionnaireResponse'),
      () => 'Based on your response',
    ],
    [
      // Both new and legacy format for Patient search
      (s) =>
        !!s.match(/^fhir:\/?\/?Patient\/[^/]+\/(search-summary|no-results)$/),
      () => 'Based on your health records',
    ],
    [
      // FHIR types other than Observation (both formats)
      (s) =>
        (s.startsWith('fhir:') || s.startsWith('fhir://')) &&
        !s.match(/^fhir:\/?\/?Observation/),
      () => 'Based on your health records',
    ],
  ];

  const matchedRule = tooltipRules.find(([predicate]) => predicate(source));
  return matchedRule ? matchedRule[1]() : undefined;
}

/**
 * Returns true for citation types that should only show inline markers
 * without rendering a card below the paragraph.
 */
export function isInlineOnlyCitation(source: string): boolean {
  if (source.startsWith('memory://')) {
    return true;
  }

  const inlineOnlyPredicates: Array<(s: string) => boolean> = [
    (s) => s.startsWith('fhir://Patient'),
    (s) => s.startsWith('chat://'),
    (s) => s.startsWith('marketplace://search'),
    // Both new and legacy format for QuestionnaireResponse
    (s) =>
      s.startsWith('fhir://QuestionnaireResponse') ||
      s.startsWith('fhir:QuestionnaireResponse'),
    // Both new and legacy format for Patient search
    (s) =>
      !!s.match(/^fhir:\/?\/?Patient\/[^/]+\/(search-summary|no-results)$/),
    // FHIR types other than Observation (both formats)
    (s) =>
      (s.startsWith('fhir:') || s.startsWith('fhir://')) &&
      !s.match(/^fhir:\/?\/?Observation/),
  ];

  return inlineOnlyPredicates.some((predicate) => predicate(source));
}
