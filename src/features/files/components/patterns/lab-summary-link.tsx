import { Link, useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIngestFile } from '@/features/files/api/ingest-file';
import { AnimatedIcon } from '@/features/messages/components/ai/animated-icon';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { File } from '@/types/api';

export function getLabSummaryState(file: File) {
  const extraction = file.ingestion?.extraction;
  const canIngest =
    file.contentType === 'application/pdf' && extraction == null;

  if (extraction == null) {
    return {
      summaryChatId: null,
      summaryMessageId: null,
      hasSummary: false,
      canGenerateSummary: false,
      canIngest,
    };
  }

  const summaryChatId = extraction.summaryChatId ?? extraction.chatId;
  const summaryMessageId = extraction.summaryMessageId ?? extraction.messageId;
  const hasSummary = summaryChatId != null && summaryMessageId != null;
  const hasWrittenResults =
    typeof extraction.counts?.written === 'number' &&
    extraction.counts.written > 0;
  const canGenerateSummary =
    !hasSummary && extraction.status === 'final' && hasWrittenResults;
  const canRetryIngest =
    file.contentType === 'application/pdf' && extraction.status === 'failed';

  return {
    summaryChatId,
    summaryMessageId,
    hasSummary,
    canGenerateSummary,
    canIngest: canRetryIngest,
  };
}

export function LabSummaryLink({
  file,
  className,
}: {
  file: File;
  className?: string;
}) {
  const {
    summaryChatId,
    summaryMessageId,
    hasSummary,
    canGenerateSummary,
    canIngest,
  } = getLabSummaryState(file);
  const { mutateAsync, isPending } = useIngestFile();
  const navigate = useNavigate();
  const resolvedClassName =
    className ??
    'rounded-lg p-2 text-zinc-500 transition-all hover:bg-white hover:text-zinc-700 hover:ring-1 hover:ring-zinc-200 hover:shadow-sm';

  const openConciergeWithFile = () => {
    useChatStore.getState().setPendingFiles([
      {
        type: 'file',
        url: `/files/${file.id}`,
        filename: file.name,
        mediaType: file.contentType,
      },
    ]);
    void navigate({
      to: '/concierge',
      search: { autoSend: true },
    });
  };

  if (hasSummary && summaryChatId != null && summaryMessageId != null) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/concierge/$id"
              params={{ id: summaryChatId }}
              search={{ ctxMessageId: summaryMessageId }}
              onClick={(event) => event.stopPropagation()}
            >
              <Button variant="ghost" size="icon" className={resolvedClassName}>
                <FileText className="size-4" />
                <span className="sr-only">View Lab Summary</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            Open the saved AI summary for this file.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!canGenerateSummary && !canIngest) {
    return null;
  }

  if (canIngest) {
    const tooltipText =
      file.ingestion?.extraction?.status === 'failed'
        ? 'Retry extraction for this file.'
        : 'Ask Superpower AI to generate a summary for this file.';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={resolvedClassName}
              disabled={isPending}
              onClick={async (event) => {
                event.stopPropagation();

                try {
                  await mutateAsync({ fileId: file.id });
                } catch (error) {
                  if (
                    !(error instanceof AxiosError) ||
                    error.response?.status !== 409
                  ) {
                    return;
                  }
                }

                openConciergeWithFile();
              }}
            >
              <AnimatedIcon state={isPending ? 'thinking' : 'idle'} size={16} />
              <span className="sr-only">Extract File</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tooltipText}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={resolvedClassName}
            onClick={(event) => {
              event.stopPropagation();
              openConciergeWithFile();
            }}
          >
            <AnimatedIcon state="idle" size={16} />
            <span className="sr-only">Generate Lab Summary</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Ask Superpower AI to generate a summary for this file.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
