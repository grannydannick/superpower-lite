import { useInfiniteQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

// ---------------------------------------------------------------------------
// Types — matching the backend schema from chatv2-search-messages-route.ts
// ---------------------------------------------------------------------------

export interface MatchPosition {
  start: number;
  length: number;
}

export interface SearchHit {
  id: string;
  userId: string;
  role: string;
  content: string;
  /** Unix timestamp (seconds or ms — backend uses number) */
  createdAt: number;
  _rankingScore?: number;
  _matchesPosition?: Record<string, MatchPosition[]>;
}

export interface SearchMessagesResponse {
  hits: SearchHit[];
  query: string;
  estimatedTotalHits?: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
}

// ---------------------------------------------------------------------------
// Fetch function
// ---------------------------------------------------------------------------

const SEARCH_PAGE_SIZE = 20;

interface SearchMessagesParams {
  query: string;
  limit?: number;
  offset?: number;
}

export const searchMessages = async ({
  query,
  limit = SEARCH_PAGE_SIZE,
  offset = 0,
}: SearchMessagesParams): Promise<SearchMessagesResponse> => {
  return api.get('/chat/chatv2/search', {
    headers: { 'x-hide-toast': 'true' },
    params: {
      q: query,
      limit,
      offset,
    },
  });
};

// ---------------------------------------------------------------------------
// React Query hook — infinite pagination
// ---------------------------------------------------------------------------

export const useSearchMessages = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['message-search', query],
    queryFn: ({ pageParam = 0 }) =>
      searchMessages({ query, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.offset + lastPage.hits.length;
      const total = lastPage.estimatedTotalHits ?? 0;
      return loaded < total ? loaded : undefined;
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
};
