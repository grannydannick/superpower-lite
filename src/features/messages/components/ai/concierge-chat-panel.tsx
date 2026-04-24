import { type MutableRefObject } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTimeline } from '@/features/messages/api/get-messages';

import { Chat } from './chat';

interface ConciergeChatPanelProps {
  jumpToMessageRef?: MutableRefObject<
    ((messageId: string) => Promise<void>) | null
  >;
  onJumpReady?: (fn: (messageId: string) => Promise<void>) => void;
  isSearchOpen?: boolean;
}

export function ConciergeChatPanel({
  jumpToMessageRef,
  onJumpReady,
  isSearchOpen,
}: ConciergeChatPanelProps) {
  const timelineQuery = useTimeline({ hideToast: true });

  if (timelineQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-8">
        <div className="ml-auto max-w-2xl">
          <Skeleton variant="shimmer" className="ml-auto h-8 w-48" />
        </div>
        <div className="flex w-full gap-2">
          <Skeleton
            variant="shimmer"
            className="mt-1 size-6 shrink-0 rounded-full"
          />
          <div className="flex flex-col gap-1.5">
            <Skeleton variant="shimmer" className="h-6 w-64" />
            <Skeleton variant="shimmer" className="h-6 w-80" />
            <Skeleton variant="shimmer" className="h-6 w-52" />
          </div>
        </div>
      </div>
    );
  }

  if (timelineQuery.isError && timelineQuery.data == null) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Alert className="max-w-lg">
          <AlertTitle>Unable to load your conversation</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>Please try again.</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void timelineQuery.refetch();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Chat
      initialMessages={timelineQuery.data ?? []}
      jumpToMessageRef={jumpToMessageRef}
      onJumpReady={onJumpReady}
      isSearchOpen={isSearchOpen}
    />
  );
}
