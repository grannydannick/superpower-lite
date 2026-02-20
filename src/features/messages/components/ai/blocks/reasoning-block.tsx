import { ChevronDown } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { cn } from '@/lib/utils';

import { formatDurationMs } from '../../../utils/extract-timing';

interface ReasoningBlockProps {
  messageId: string;
  partIndex: number;
  text: string;
  state?: string;
  isMemoryUpdating?: boolean;
  /** Combined timing in milliseconds (thinking + tools) */
  timingMs?: number | null;
}

export const ReasoningBlock = memo(function ReasoningBlock({
  messageId,
  partIndex,
  text,
  state,
  isMemoryUpdating = false,
  timingMs,
}: ReasoningBlockProps) {
  const isThinking = state === 'streaming';
  const hasInitialized = useRef(false);

  // Format timing for display
  const timingLabel =
    timingMs != null && timingMs > 0 ? formatDurationMs(timingMs) : null;

  // Initialize: open if thinking, closed if already done (history)
  const [accordionValue, setAccordionValue] = useState<string | undefined>(() =>
    isThinking ? 'thinking' : undefined,
  );

  // Auto-close when thinking completes (but not on initial render for history)
  useEffect(() => {
    if (hasInitialized.current && !isThinking) {
      setAccordionValue(undefined);
    }
    hasInitialized.current = true;
  }, [isThinking]);

  return (
    <Accordion
      type="single"
      collapsible
      value={accordionValue}
      onValueChange={setAccordionValue}
      className="w-full"
    >
      <AccordionItem
        value="thinking"
        className="border-none"
        key={`${messageId}:reasoning:${partIndex}`}
      >
        <button
          type="button"
          onClick={() =>
            setAccordionValue(
              accordionValue === 'thinking' ? undefined : 'thinking',
            )
          }
          className="flex items-center gap-1 py-1"
        >
          {isMemoryUpdating ? (
            <TextShimmer className="font-medium">
              Updating memory...
            </TextShimmer>
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
              accordionValue === 'thinking' && 'rotate-180',
            )}
          />
        </button>
        <AccordionContent className="pb-2 pt-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-tertiary">
            {text}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});
