import { useNavigate, useSearch } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { ConciergeChatPanel } from '@/features/messages/components/ai/concierge-chat-panel';
import { MessageSearchDialog } from '@/features/messages/components/ai/message-search-dialog';
import { CareTeamDialog } from '@/features/messages/components/care-team-dialog';

export const ConciergeLayout = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const jumpToMessageRef = useRef<
    ((messageId: string) => Promise<void>) | null
  >(null);
  const [jumpToMessage, setJumpToMessage] = useState<
    ((messageId: string) => Promise<void>) | null
  >(null);
  const navigate = useNavigate();
  const ctxMessageId = useSearch({
    from: '/_app/concierge',
    select: (s) => s.ctxMessageId,
  });

  const handleJumpReady = useCallback(
    (fn: (messageId: string) => Promise<void>) => {
      jumpToMessageRef.current = fn;
      setJumpToMessage(() => fn);
    },
    [],
  );

  // Jump to the target message when arriving via deep-link (ctxMessageId).
  // Depends on jumpToMessage (state) so it re-runs once Chat mounts.
  useEffect(() => {
    if (ctxMessageId == null || jumpToMessage == null) return;

    toast.promise(jumpToMessage(ctxMessageId), {
      loading: 'Scrolling to message...',
      success: () => 'Message found',
      error: () => 'Could not find message',
    });

    // Clear the search param so a refresh doesn't re-trigger
    void navigate({
      to: '/concierge',
      search: (prev) => ({ ...prev, ctxMessageId: undefined }),
      replace: true,
    });
  }, [ctxMessageId, jumpToMessage, navigate]);

  const handleSelectResult = useCallback((messageId: string) => {
    const jump = jumpToMessageRef.current;
    if (!jump) return;

    toast.promise(jump(messageId), {
      loading: 'Scrolling to message...',
      success: () => 'Message found',
      error: () => 'Could not find message',
    });
  }, []);

  // Global ⌘K / Ctrl+K listener (must be on document to work regardless of focus)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-[calc(100dvh-72px)] flex-col overflow-hidden md:h-[calc(100dvh-68px)]">
      <div className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between px-4 py-2 lg:px-16 lg:py-3">
        <CareTeamDialog
          trigger={
            <button className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-zinc-100">
              <img
                className="size-5 rounded-full object-cover"
                src="/services/doctors/doc_1.webp"
                alt="Text Care Team"
              />
              Text Care Team
            </button>
          }
        />
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-zinc-100"
        >
          <Search className="size-4" />
          Search
        </button>
        <MessageSearchDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onSelectResult={handleSelectResult}
        />
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4">
        <ConciergeChatPanel
          jumpToMessageRef={jumpToMessageRef}
          onJumpReady={handleJumpReady}
          isSearchOpen={searchOpen}
        />
      </div>
    </div>
  );
};
