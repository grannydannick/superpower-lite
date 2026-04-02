import { IconFileText } from '@central-icons-react/round-filled-radius-2-stroke-1.5/IconFileText';
import { useQueryClient } from '@tanstack/react-query';
import { m } from 'framer-motion';
import { memo, useCallback, useRef, useState } from 'react';

import { FILE_EXTRACTION_PHASE_LABELS } from '@/features/files/const/extraction-labels';

import type { FileIngestionDataPart } from '../../../utils/data-parts';

const COMPLETE_DISPLAY_MS = 5000;

/** Map each phase/status to the start of its progress range. */
const PHASE_PROGRESS: Record<string, number> = {
  registered: 5,
  classifying: 15,
  extracting: 35,
  validating: 65,
  writing: 85,
  final: 100,
  failed: 0,
};

/** Derive a target progress % purely from the current status + phase. */
function progressFromState(
  status: string | null | undefined,
  phase: string | null | undefined,
  isComplete: boolean,
): number {
  if (isComplete) return 100;
  if (status === 'registered') return PHASE_PROGRESS.registered;
  if (typeof phase === 'string' && phase in PHASE_PROGRESS) {
    return PHASE_PROGRESS[phase];
  }
  // processing but no phase yet
  if (status === 'processing') return PHASE_PROGRESS.classifying;
  return 0;
}

export const FileIngestionBlock = memo(function FileIngestionBlock({
  parts,
}: {
  parts: FileIngestionDataPart[];
}) {
  const queryClient = useQueryClient();
  const latestByFile = new Map<string, FileIngestionDataPart>();
  let unknownFileCount = 0;
  for (const part of parts) {
    const fileId = part.data.fileId;
    const key = fileId ?? `unknown-${unknownFileCount}`;
    if (fileId == null) unknownFileCount += 1;
    latestByFile.set(key, part);
  }
  let anyProcessing = false;
  let anyFailed = false;
  let allComplete = latestByFile.size > 0;
  let totalWritten = 0;
  let processingPart: FileIngestionDataPart | null = null;
  let failedPart: FileIngestionDataPart | null = null;
  const completedFileIds: Array<string | undefined> = [];

  for (const part of latestByFile.values()) {
    const data = part.data;
    completedFileIds.push(data.fileId);
    if (typeof data.writtenCount === 'number')
      totalWritten += data.writtenCount;
    if (data.status === 'registered' || data.status === 'processing') {
      anyProcessing = true;
      if (processingPart === null) processingPart = part;
    }
    if (data.state === 'complete' && data.status === 'failed') {
      anyFailed = true;
      if (failedPart === null) failedPart = part;
    }
    if (data.state !== 'complete' || data.status !== 'final')
      allComplete = false;
  }

  const completionKey = allComplete ? completedFileIds.join(',') : null;
  const fileCount = latestByFile.size;
  const phase = processingPart?.data.phase;
  let phaseLabel: string | null = null;
  if (typeof phase === 'string' && phase in FILE_EXTRACTION_PHASE_LABELS) {
    phaseLabel = FILE_EXTRACTION_PHASE_LABELS[phase];
  }
  const processingLabel =
    phaseLabel !== null
      ? `${phaseLabel}...`
      : fileCount <= 1
        ? 'Processing...'
        : `Processing ${fileCount} documents...`;
  const completeLabel =
    totalWritten > 0
      ? `Extracted ${totalWritten} lab result${totalWritten !== 1 ? 's' : ''}`
      : 'Processing complete';
  const hasSeenProcessingRef = useRef(anyProcessing);
  const invalidatedCompletionKeysRef = useRef<Set<string>>(new Set());
  const dismissedCompletionKeysRef = useRef<Set<string>>(new Set());
  const completionDismissTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const scheduledDismissCompletionKeyRef = useRef<string | null>(null);
  const [, setDismissedVersion] = useState(0);

  if (anyProcessing) hasSeenProcessingRef.current = true;

  const showCompletion =
    completionKey !== null &&
    hasSeenProcessingRef.current &&
    !dismissedCompletionKeysRef.current.has(completionKey);
  let showState: 'processing' | 'complete' | 'failed' | 'hidden' = 'hidden';
  if (anyProcessing) showState = 'processing';
  else if (showCompletion) showState = 'complete';
  else if (anyFailed) showState = 'failed';

  const setCompleteBlockRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node === null) {
        if (completionDismissTimeoutRef.current !== null) {
          clearTimeout(completionDismissTimeoutRef.current);
          completionDismissTimeoutRef.current = null;
        }
        scheduledDismissCompletionKeyRef.current = null;
        return;
      }
      if (completionKey === null) return;

      if (!invalidatedCompletionKeysRef.current.has(completionKey)) {
        invalidatedCompletionKeysRef.current.add(completionKey);
        queryClient.invalidateQueries({ queryKey: ['biomarkers'] });
        queryClient.invalidateQueries({ queryKey: ['files'] });
        queryClient.invalidateQueries({ queryKey: ['summary'] });
      }
      if (
        dismissedCompletionKeysRef.current.has(completionKey) ||
        scheduledDismissCompletionKeyRef.current === completionKey
      ) {
        return;
      }
      if (completionDismissTimeoutRef.current !== null) {
        clearTimeout(completionDismissTimeoutRef.current);
      }
      scheduledDismissCompletionKeyRef.current = completionKey;
      completionDismissTimeoutRef.current = setTimeout(() => {
        if (dismissedCompletionKeysRef.current.has(completionKey)) return;
        dismissedCompletionKeysRef.current.add(completionKey);
        setDismissedVersion((curr) => curr + 1);
        completionDismissTimeoutRef.current = null;
        if (scheduledDismissCompletionKeyRef.current === completionKey) {
          scheduledDismissCompletionKeyRef.current = null;
        }
      }, COMPLETE_DISPLAY_MS);
    },
    [completionKey, queryClient],
  );

  const handleCompleteAnimationEnd = useCallback(() => {
    if (completionKey === null) return;
    if (dismissedCompletionKeysRef.current.has(completionKey)) return;
    if (
      completionDismissTimeoutRef.current !== null &&
      scheduledDismissCompletionKeyRef.current === completionKey
    ) {
      clearTimeout(completionDismissTimeoutRef.current);
      completionDismissTimeoutRef.current = null;
      scheduledDismissCompletionKeyRef.current = null;
    }
    dismissedCompletionKeysRef.current.add(completionKey);
    setDismissedVersion((curr) => curr + 1);
  }, [completionKey]);

  const progress = progressFromState(
    processingPart?.data.status ?? (allComplete ? 'final' : null),
    phase,
    showState === 'complete',
  );
  const displayPercent = Math.round(progress);

  if (showState === 'hidden') return null;
  const isComplete = showState === 'complete';
  let failedData: FileIngestionDataPart['data'] | null = null;
  if (showState === 'failed' && failedPart !== null) {
    failedData = failedPart.data;
  }
  const isFailed = failedData !== null;
  const primaryLabel = isFailed
    ? typeof failedData?.filename === 'string' && failedData.filename.length > 0
      ? failedData.filename
      : 'Document'
    : isComplete
      ? completeLabel
      : processingLabel;
  const secondaryLabel = isFailed
    ? typeof failedData?.error === 'string' && failedData.error.length > 0
      ? failedData.error
      : null
    : null;

  return (
    <m.div
      ref={isComplete ? setCompleteBlockRef : undefined}
      key={isComplete ? (completionKey ?? 'complete') : 'default'}
      className="my-1 flex items-center gap-1.5 rounded-full border border-zinc-100 bg-white px-4 py-2.5 pl-2"
      initial={isComplete ? { opacity: 1 } : undefined}
      animate={isComplete ? { opacity: [1, 1, 0] } : undefined}
      transition={
        isComplete
          ? {
              duration: 0.35,
              ease: 'easeOut',
              delay: (COMPLETE_DISPLAY_MS - 350) / 1000,
            }
          : undefined
      }
      onAnimationComplete={isComplete ? handleCompleteAnimationEnd : undefined}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl text-zinc-400">
        <IconFileText />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-zinc-700">
            {primaryLabel}
          </span>
          {showState === 'processing' && (
            <span className="shrink-0 text-sm tabular-nums text-zinc-700">
              {displayPercent}%
            </span>
          )}
        </div>
        {secondaryLabel !== null && (
          <span className="truncate text-xs text-red-500">
            {secondaryLabel}
          </span>
        )}
        {(showState === 'processing' || isComplete) && (
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-zinc-200">
            <m.div
              className="h-full rounded-full bg-vermillion-900"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>
    </m.div>
  );
});
