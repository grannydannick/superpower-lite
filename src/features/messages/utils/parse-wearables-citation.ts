import type { CitationInfo } from '../types/message-parts';

export interface ParsedWearablesCitation {
  kind: 'summary' | 'timeseries' | 'stream';
  resource: string;
  id?: string;
  provider?: string;
}

/**
 * Attempts to parse a citation as a wearables reference.
 * Returns null if the citation is not a wearables:// URI.
 *
 * Expected source formats:
 *   - "wearables://summary/<resource>/<id>?provider=..."
 *   - "wearables://timeseries/<resource>?..."
 *   - "wearables://stream/<sleep|workout>/<id>?..."
 */
export function parseWearablesCitation(
  citation: CitationInfo,
): ParsedWearablesCitation | null {
  if (!citation.source.startsWith('wearables://')) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(citation.source);
  } catch {
    return null;
  }

  const kind = url.hostname.toLowerCase();
  if (kind !== 'summary' && kind !== 'timeseries' && kind !== 'stream') {
    return null;
  }

  const segments = url.pathname.split('/').filter((s) => s.trim().length > 0);

  const resource = segments[0];
  if (!resource) {
    return null;
  }

  const id = segments[1];
  const provider = url.searchParams.get('provider') ?? undefined;

  return { kind, resource, id, provider };
}
