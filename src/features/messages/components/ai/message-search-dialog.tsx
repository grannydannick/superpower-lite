import { format, isToday } from 'date-fns';
import { ChevronRight, Search, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type MatchPosition,
  type SearchHit,
  useSearchMessages,
} from '@/features/messages/api/search-messages';
import { useAnalytics } from '@/hooks/use-analytics';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Highlight helper — splits text at match boundaries and wraps matches
// ---------------------------------------------------------------------------

function HighlightedText({
  text,
  matches,
}: {
  text: string;
  matches: MatchPosition[];
}) {
  if (matches.length === 0) return <>{text}</>;

  const sorted = [...matches].sort((a, b) => a.start - b.start);
  const segments: { text: string; highlighted: boolean }[] = [];
  let cursor = 0;

  for (const { start, length } of sorted) {
    const end = start + length;
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlighted: false });
    }
    segments.push({ text: text.slice(start, end), highlighted: true });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <mark
            key={i}
            className="bg-transparent font-medium text-vermillion-900"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Date grouping
// ---------------------------------------------------------------------------

function formatDateHeader(timestamp: number): string {
  // createdAt is a unix timestamp (seconds); Date expects milliseconds
  const date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
  if (isToday(date)) return 'Today';
  return format(date, 'd MMM yyyy');
}

function groupByDate(hits: SearchHit[]) {
  const groups: { label: string; hits: SearchHit[] }[] = [];
  let currentLabel = '';

  for (const hit of hits) {
    const label = formatDateHeader(hit.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, hits: [] });
    }
    groups.at(-1)!.hits.push(hit);
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Snippet extraction — show lines around the first match instead of the start
// ---------------------------------------------------------------------------

function getSnippetAroundMatch(
  content: string,
  matches: MatchPosition[],
  contextChars = 80,
): { snippet: string; adjustedMatches: MatchPosition[] } {
  if (matches.length === 0 || content.length <= contextChars * 2) {
    return { snippet: content, adjustedMatches: matches };
  }

  const first = matches[0];
  const snippetStart = Math.max(0, first.start - contextChars);
  const snippetEnd = Math.min(
    content.length,
    first.start + first.length + contextChars,
  );

  const prefix = snippetStart > 0 ? '\u2026' : '';
  const suffix = snippetEnd < content.length ? '\u2026' : '';
  const raw = content.slice(snippetStart, snippetEnd);
  const snippet = `${prefix}${raw}${suffix}`;

  const adjustedMatches = matches
    .filter((m) => m.start + m.length > snippetStart && m.start < snippetEnd)
    .map((m) => {
      const newStart = m.start - snippetStart + prefix.length;
      const newLength = Math.min(m.length, snippetEnd - m.start);
      return { start: Math.max(0, newStart), length: newLength };
    });

  return { snippet, adjustedMatches };
}

// ---------------------------------------------------------------------------
// Client-side match positions — more accurate than backend token positions
// ---------------------------------------------------------------------------

function findMatchPositions(text: string, query: string): MatchPosition[] {
  if (query.length < 2) return [];
  const positions: MatchPosition[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let index = 0;
  while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
    positions.push({ start: index, length: query.length });
    index += query.length;
  }
  return positions;
}

// ---------------------------------------------------------------------------
// Search result item
// ---------------------------------------------------------------------------

function SearchResultItem({
  hit,
  query,
  onSelect,
}: {
  hit: SearchHit;
  query: string;
  onSelect: () => void;
}) {
  const isUser = hit.role === 'user';
  const rawMatches = findMatchPositions(hit.content, query);
  const { snippet, adjustedMatches } = getSnippetAroundMatch(
    hit.content,
    rawMatches,
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100',
        isUser && 'justify-end',
      )}
    >
      <p
        className={cn(
          'line-clamp-3 min-w-0 text-sm text-zinc-500',
          isUser &&
            'rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-700 shadow-sm',
        )}
      >
        <HighlightedText text={snippet} matches={adjustedMatches} />
      </p>
      <ChevronRight className="size-4 shrink-0 text-zinc-400 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-secondary" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Recent searches — localStorage-backed, last 5, sync reads only
// ---------------------------------------------------------------------------

const RECENT_SEARCHES_KEY = 'concierge-recent-searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is string => typeof s === 'string')
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return;
  const current = getRecentSearches().filter((s) => s !== trimmed);
  const next = [trimmed, ...current].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    // storage full — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Shared search content (used by both Dialog and Sheet)
// ---------------------------------------------------------------------------

function SearchContent({
  onClose,
  onSelectResult,
}: {
  onClose: () => void;
  onSelectResult: (messageId: string) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);
  const { track } = useAnalytics();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSearchMessages(debouncedQuery);

  const allHits = useMemo(
    () => data?.pages.flatMap((p) => p.hits) ?? [],
    [data?.pages],
  );
  const groups = useMemo(() => groupByDate(allHits), [allHits]);
  const isInitialFetch = isFetching && !isFetchingNextPage;

  // Auto-load next page when scrolled near the bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom <= 120) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const trimmed = value.trim();
        setDebouncedQuery(trimmed);
        if (trimmed.length >= 2) {
          track('message_search_executed', { query: trimmed });
        }
      }, 300);
    },
    [track],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    setDebouncedQuery('');
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleSelectRecent = useCallback((query: string) => {
    setInputValue(query);
    setDebouncedQuery(query);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleSelect = useCallback(
    (messageId: string) => {
      if (debouncedQuery.length >= 2) {
        addRecentSearch(debouncedQuery);
        setRecentSearches(getRecentSearches());
      }
      track('message_search_result_selected', {
        query: debouncedQuery,
        message_id: messageId,
        result_count: allHits.length,
      });
      onSelectResult(messageId);
      onClose();
    },
    [onSelectResult, onClose, debouncedQuery, track, allHits.length],
  );

  const showEmpty =
    debouncedQuery.length >= 2 && !isFetching && groups.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <h2 className="text-base font-semibold">Messages</h2>
        <Button
          type="button"
          variant="ghost"
          size="medium"
          onClick={onClose}
          className="-mr-2"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Search input */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200/50 bg-white px-3 py-3 shadow-sm transition-all duration-200 focus-within:border-zinc-200">
          <Search className="size-4 shrink-0 text-zinc-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            ref={(el) => el?.focus()}
          />
          {inputValue.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 text-zinc-400 hover:text-zinc-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-1"
        onScroll={handleScroll}
      >
        {/* Recent searches — shown when no query */}
        {debouncedQuery.length < 2 &&
          !isFetching &&
          recentSearches.length > 0 && (
            <div>
              <div className="px-3 pb-1 pt-2 text-xs font-medium text-zinc-400">
                Recent Searches
              </div>
              {recentSearches.map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => handleSelectRecent(query)}
                  className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100"
                >
                  <span className="text-base font-medium text-zinc-900">
                    {query}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-zinc-400 transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:text-secondary" />
                </button>
              ))}
            </div>
          )}

        {isInitialFetch && debouncedQuery.length >= 2 && (
          <div className="flex flex-col gap-2 px-6 py-3">
            <div className="flex justify-end">
              <Skeleton variant="shimmer" className="h-12 w-3/4 rounded-xl" />
            </div>
            <Skeleton variant="shimmer" className="h-16 w-5/6 rounded-lg" />
            <div className="flex justify-end">
              <Skeleton variant="shimmer" className="h-10 w-2/3 rounded-xl" />
            </div>
            <Skeleton variant="shimmer" className="h-14 w-4/5 rounded-lg" />
            <div className="flex justify-end">
              <Skeleton variant="shimmer" className="h-10 w-1/2 rounded-xl" />
            </div>
          </div>
        )}

        {showEmpty && (
          <div className="flex items-center justify-center py-8 text-sm text-zinc-400">
            No messages found.
          </div>
        )}

        {!isInitialFetch &&
          groups.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-1 pt-3 text-xs font-medium">
                {group.label}
              </div>
              {group.hits.map((hit) => (
                <SearchResultItem
                  key={hit.id}
                  hit={hit}
                  query={debouncedQuery}
                  onSelect={() => handleSelect(hit.id)}
                />
              ))}
            </div>
          ))}

        {isFetchingNextPage && (
          <div className="flex flex-col gap-2 px-6 py-3">
            <Skeleton variant="shimmer" className="h-14 w-5/6 rounded-lg" />
            <div className="flex justify-end">
              <Skeleton variant="shimmer" className="h-10 w-2/3 rounded-xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export — responsive Dialog (desktop) / Sheet (mobile)
// ---------------------------------------------------------------------------

interface MessageSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectResult: (messageId: string) => void;
}

export function MessageSearchDialog({
  open,
  onOpenChange,
  onSelectResult,
}: MessageSearchDialogProps) {
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;

  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex max-h-[85vh] flex-col gap-0 rounded-t-2xl p-0">
          <SearchContent
            onClose={handleClose}
            onSelectResult={onSelectResult}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="z-[60]" />
      <DialogContent
        isStacked
        className="z-[60] flex h-[min(80vh,520px)] max-w-[calc(100%-1rem)] flex-col overflow-hidden rounded-2xl p-0 shadow-lg md:max-w-md"
      >
        <SearchContent onClose={handleClose} onSelectResult={onSelectResult} />
      </DialogContent>
    </Dialog>
  );
}
