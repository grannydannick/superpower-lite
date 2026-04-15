import { AnimatePresence, m } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Streamdown } from 'streamdown';

import { AIIcon } from '@/components/icons/ai-icon';
import { getBiomarkerColor } from '@/components/ui/charts/utils/get-biomarker-color';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { cn } from '@/lib/utils';
import type { BiomarkerStatus } from '@/types/api';

import { formatDurationMs } from '../../../utils/extract-timing';
import type { ReasoningEntry } from '../../../utils/parse-bash-tool-actions';
import { formatActionLabel } from '../../../utils/parse-bash-tool-actions';
import { AnimatedIcon } from '../animated-icon';

// ============================================================================
// Types
// ============================================================================

/** A flattened step in the timeline. */
type TimelineItem =
  | { kind: 'text'; text: string }
  | {
      kind: 'action';
      label: string;
      actionType: string;
      count: number;
      badges?: Array<{ name: string; status: string; showDot?: boolean }>;
    };

interface ReasoningBlockProps {
  messageId: string;
  partIndex: number;
  entries: ReasoningEntry[];
  state?: string;
  /** Last reasoning block with no text after it while streaming */
  isActive?: boolean;
  isMemoryUpdating?: boolean;
  timingMs?: number | null;
}

// ============================================================================
// Helpers
// ============================================================================

const PLURAL_LABELS: Record<string, string> = {
  'Queried FHIR Observation': 'Queried FHIR Observations',
  'Queried FHIR CarePlan': 'Queried FHIR CarePlans',
  'Queried FHIR Goal': 'Queried FHIR Goals',
  'Queried FHIR MedicationRequest': 'Queried FHIR MedicationRequests',
  'Queried FHIR DiagnosticReport': 'Queried FHIR DiagnosticReports',
  'Queried FHIR Communication': 'Queried FHIR Communications',
  'Queried health records': 'Queried health records',
  'Searched knowledge base': 'Searched knowledge base',
  'Reading skill': 'Reading skills',
  'Saved memory': 'Saved memories',
  'Recalled memory': 'Recalled memories',
  'Read file': 'Read files',
  'Searched marketplace': 'Searched marketplace',
};

function getActionLabel(label: string, count: number): string {
  if (count <= 1) return label;
  return PLURAL_LABELS[label] ?? label;
}

/**
 * Flatten entries into individual timeline items.
 * Text entries are split on double-newlines so each paragraph gets its own step.
 * Action entries become their own steps with a formatted label.
 * Consecutive same-type actions are merged into one with combined badges.
 */
function flattenEntries(entries: ReasoningEntry[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const entry of entries) {
    if (entry.kind === 'text') {
      const paragraphs = entry.text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      for (const p of paragraphs) {
        items.push({ kind: 'text', text: p });
      }
    } else if (entry.kind === 'biomarkers') {
      // Attach badges to the last action item
      for (let i = items.length - 1; i >= 0; i--) {
        const prev = items[i];
        if (prev?.kind === 'action') {
          prev.badges = [...(prev.badges ?? []), ...entry.items];
          break;
        }
      }
    } else {
      const actionType = entry.action.type;
      const label = formatActionLabel(entry.action);
      const newBadges: Array<{
        name: string;
        status: string;
        showDot?: boolean;
      }> = [];
      if (entry.action.type === 'skill-read') {
        newBadges.push({ name: entry.action.skillName, status: 'PENDING' });
      }

      // Merge consecutive same-type actions into one item
      const last = items[items.length - 1];
      if (last?.kind === 'action' && last.actionType === actionType) {
        last.count++;
        if (newBadges.length > 0) {
          last.badges = [...(last.badges ?? []), ...newBadges];
        }
      } else {
        items.push({
          kind: 'action',
          label,
          actionType,
          count: 1,
          badges: newBadges.length > 0 ? newBadges : undefined,
        });
      }
    }
  }

  return items;
}

// ============================================================================
// Timeline Step
// ============================================================================

function TimelineStep({
  item,
  isFirst,
  isLast,
  isStreaming,
}: {
  item: TimelineItem;
  isFirst: boolean;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const isActiveStep = isLast && isStreaming;

  return (
    <div className="flex min-h-0 gap-3">
      {/* Left rail: connector above + dot + line below */}
      <div className="flex flex-col items-center">
        {/* Connector from previous step's line to this dot */}
        {!isFirst && (
          <div
            className={cn(
              'w-px bg-zinc-200',
              isActiveStep ? 'h-[2px]' : 'h-[6px]',
            )}
          />
        )}
        {isFirst && <div className={isActiveStep ? 'h-[2px]' : 'h-[6px]'} />}
        {isActiveStep ? (
          <AnimatedIcon
            state="thinking"
            size={16}
            className="-ml-[4.5px] -mr-[4.5px] shrink-0"
          />
        ) : (
          <div className="size-[7px] shrink-0 rounded-[2px] bg-zinc-300" />
        )}
        {!isLast &&
          (isStreaming ? (
            <m.div
              className="w-px flex-1 bg-zinc-200"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ originY: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          ) : (
            <div className="w-px flex-1 bg-zinc-200" />
          ))}
      </div>

      {/* Right: content */}
      <div className={cn('flex-1', !isLast && 'pb-2')}>
        {item.kind === 'text' ? (
          <div className="text-sm leading-relaxed text-tertiary [&_*]:text-sm [&_*]:text-tertiary">
            <Streamdown>{item.text}</Streamdown>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed text-tertiary/70">
              {getActionLabel(item.label, item.count)}
            </p>
            {item.badges && item.badges.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {item.badges.map((badge) => {
                  const colors = getBiomarkerColor(
                    badge.status as BiomarkerStatus,
                  );
                  return (
                    <span
                      key={badge.name}
                      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        color: colors.default,
                        backgroundColor: colors.light,
                      }}
                    >
                      {badge.showDot && (
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: colors.default }}
                        />
                      )}
                      {badge.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Reasoning Block (Timeline)
// ============================================================================

export const ReasoningBlock = memo(function ReasoningBlock({
  messageId,
  partIndex,
  entries,
  state,
  isActive = false,
  isMemoryUpdating = false,
  timingMs,
}: ReasoningBlockProps) {
  const isThinking = state === 'streaming' || isActive;
  const hasInitialized = useRef(false);

  const timingLabel =
    timingMs != null && timingMs > 0 ? formatDurationMs(timingMs) : null;

  const items = useMemo(() => flattenEntries(entries), [entries]);

  // Open if active/thinking, closed for history
  const [isOpen, setIsOpen] = useState<boolean>(
    () => isActive || state === 'streaming',
  );

  // Auto-open when becoming active, auto-close when text follows
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    if (isActive) {
      setIsOpen(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isActive]);

  return (
    <div
      className="w-full"
      key={`${messageId}:reasoning:${partIndex}`}
      {...(isOpen ? { 'data-reasoning-open': '' } : {})}
    >
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1 py-1"
      >
        <m.div
          className="shrink-0 overflow-hidden"
          animate={{
            width: isOpen ? 0 : 'auto',
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {isThinking ? (
            <AnimatedIcon state="thinking" className="mr-1" />
          ) : (
            <AIIcon fill="#A1A1AA" className="mr-1" />
          )}
        </m.div>
        {isMemoryUpdating ? (
          <TextShimmer className="font-medium">Updating memory...</TextShimmer>
        ) : isThinking ? (
          <TextShimmer className="font-medium">Thinking...</TextShimmer>
        ) : (
          <span className="font-medium text-tertiary">
            {timingLabel ? `Thought for ${timingLabel}` : 'Thought'}
          </span>
        )}
        <ChevronDown
          className={cn(
            'size-4 text-tertiary transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Timeline content */}
      <AnimatePresence initial={false}>
        {isOpen && items.length > 0 && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col pb-1 pl-1 pt-1">
              {items.map((item, i) => (
                <TimelineStep
                  key={i}
                  item={item}
                  isFirst={i === 0}
                  isLast={i === items.length - 1}
                  isStreaming={isThinking}
                />
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
});
