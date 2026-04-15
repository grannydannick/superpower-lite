import { getToolName, isToolUIPart, type UIMessage } from 'ai';

import { CompactionBlock } from '../components/ai/blocks/compaction-block';
import { FileIngestionBlock } from '../components/ai/blocks/file-ingestion-block';
import { MetadataBlock } from '../components/ai/blocks/metadata-block';
import { ReasoningBlock } from '../components/ai/blocks/reasoning-block';
import type {
  CitationInfo,
  ParsedBlock,
  ParsedMessageResult,
} from '../types/message-parts';

import { isCompactionDataPart, isFileIngestionDataPart } from './data-parts';
import { getReasoningTimingMs } from './extract-timing';
import { safeJsonStringify } from './json';
import type {
  BashToolAction,
  BiomarkerBadge,
  ReasoningEntry,
} from './parse-bash-tool-actions';
import { parseBashToolActions } from './parse-bash-tool-actions';
import {
  extractCitationsFromMarkdown,
  transformCitationLinksToMarkers,
} from './parse-citation-links';

// ============================================================================
// FHIR Observation Extraction
// ============================================================================

function mapFhirInterpretation(interpretation: unknown): string {
  if (!Array.isArray(interpretation) || interpretation.length === 0)
    return 'PENDING';
  const first = interpretation[0];
  if (first == null || typeof first !== 'object') return 'PENDING';
  const rec = first as Record<string, unknown>;
  const text =
    typeof rec.text === 'string'
      ? rec.text
      : Array.isArray(rec.coding) && rec.coding.length > 0
        ? (((rec.coding[0] as Record<string, unknown>)?.code as string) ?? '')
        : '';
  const lower = text.toLowerCase();
  if (lower.includes('optimal')) return 'OPTIMAL';
  if (lower.includes('normal') || lower === 'n') return 'NORMAL';
  if (lower.includes('high') || lower === 'h' || lower === 'hh') return 'HIGH';
  if (lower.includes('low') || lower === 'l' || lower === 'll') return 'LOW';
  if (lower.includes('abnormal') || lower === 'a') return 'HIGH';
  return 'PENDING';
}

function extractBiomarkersFromFhirJson(json: unknown): BiomarkerBadge[] {
  if (json == null || typeof json !== 'object') return [];

  const observations: unknown[] = [];
  const obj = json as Record<string, unknown>;

  if (obj.resourceType === 'Observation') {
    observations.push(obj);
  } else if (obj.resourceType === 'Bundle' && Array.isArray(obj.entry)) {
    for (const entry of obj.entry) {
      const resource = (entry as Record<string, unknown>)?.resource;
      if (
        resource != null &&
        typeof resource === 'object' &&
        (resource as Record<string, unknown>).resourceType === 'Observation'
      ) {
        observations.push(resource);
      }
    }
  } else if (Array.isArray(json)) {
    for (const item of json) {
      if (
        item != null &&
        typeof item === 'object' &&
        (item as Record<string, unknown>).resourceType === 'Observation'
      ) {
        observations.push(item);
      }
    }
  }

  const badges: BiomarkerBadge[] = [];
  for (const obs of observations) {
    const rec = obs as Record<string, unknown>;
    const code = rec.code as Record<string, unknown> | undefined;
    if (code == null) continue;
    const name =
      typeof code.text === 'string' && code.text.trim().length > 0
        ? code.text.trim()
        : null;
    if (name == null) continue;
    const status = mapFhirInterpretation(rec.interpretation);
    badges.push({ name, status, showDot: true });
  }
  return badges;
}

// ============================================================================
// Type Guards
// ============================================================================

function isTextPart(part: unknown): part is {
  type: 'text';
  text: string;
  state?: string;
  providerMetadata?: Record<string, unknown>;
} {
  return (
    typeof part === 'object' &&
    part !== null &&
    (part as { type?: string }).type === 'text'
  );
}

function isReasoningPart(part: unknown): part is {
  type: 'reasoning';
  text: string;
  state?: string;
  providerMetadata?: Record<string, unknown>;
} {
  return (
    typeof part === 'object' &&
    part !== null &&
    (part as { type?: string }).type === 'reasoning'
  );
}

function isDataPart(part: unknown): part is { type: string; data: unknown } {
  if (typeof part !== 'object' || part === null) return false;
  const p = part as { type?: string };
  return typeof p.type === 'string' && p.type.startsWith('data-');
}

function isStepStartPart(part: unknown): boolean {
  return (
    typeof part === 'object' &&
    part !== null &&
    (part as { type?: string }).type === 'step-start'
  );
}

export function isMemoryUpdateInProgress(
  parts: UIMessage['parts'],
  isStreaming: boolean,
): boolean {
  for (const part of parts) {
    if (isToolUIPart(part)) {
      const toolName = getToolName(part);

      // Check for memory_update tool (chatv1) or bash tool running retain command (chatv2)
      if (toolName === 'memory_update') {
        return part.state !== 'output-available';
      }
      if (toolName === 'bash') {
        // AI SDK v6 DynamicToolUIPart has input directly on part
        const partAny = part as unknown as {
          state: string;
          input?: { command?: string };
        };
        const command = partAny.input?.command ?? '';
        const isRetainCommand = command.includes('retain');

        if (isRetainCommand) {
          // Show "Saving memory" if:
          // 1. The retain command is in progress (not yet output-available), OR
          // 2. The retain command just completed but we're still streaming
          //    (shows the indicator briefly while AI finishes responding)
          if (part.state !== 'output-available') {
            return true;
          }
          // If streaming and retain just completed, show briefly
          // This handles fast-completing retain commands
          if (isStreaming && part.state === 'output-available') {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Parse message parts into renderable blocks with citation tracking
 */
export function parseMessageParts(
  message: UIMessage,
  isStreaming: boolean,
): ParsedMessageResult {
  let paragraphSerial = 0;
  let pendingText = '';
  let pendingTextStreaming = false;
  const citations = new Map<string, CitationInfo>();
  let nextCitationNumber = 1;

  // Check if memory is being updated (retain command in progress or just completed while streaming)
  const isMemoryUpdating = isMemoryUpdateInProgress(message.parts, isStreaming);

  const blocks: ParsedBlock[] = [];
  let reasoningIndex = 0;
  let pendingReasoning: {
    entries: ReasoningEntry[];
    reasoningCount: number;
    startIndex: number;
    hasStreaming: boolean;
  } | null = null;

  // Collect all tool actions for the top-level result
  const allToolActions: BashToolAction[] = [];

  let fileIngestionBlockAdded = false;
  let compactionBlockAdded = false;

  const pushParagraph = (
    paragraphText: string,
    done: boolean,
    citationKeysForParagraph: Set<string>,
  ): void => {
    if (paragraphText.trim().length === 0) {
      return;
    }
    blocks.push({
      kind: 'paragraph',
      key: `${message.id}:p:${paragraphSerial++}`,
      text: paragraphText,
      done,
      isStreaming: pendingTextStreaming,
      citationKeys: [...citationKeysForParagraph],
    });
  };

  // Extract citation keys that appear in a specific text
  const getCitationKeysInText = (text: string): Set<string> => {
    const keys = new Set<string>();
    // Look for citation markers like [[1]](#msgid-citation-1)
    const markerRegex = /\[\[(\d+)\]\]\(#[^)]+\)/g;
    let match;
    while ((match = markerRegex.exec(text)) !== null) {
      const citationNum = parseInt(match[1], 10);
      // Find the citation key by number
      for (const [key, info] of citations) {
        if (info.number === citationNum) {
          keys.add(key);
          break;
        }
      }
    }
    return keys;
  };

  const flushByBlankLines = (): void => {
    let match = /\n\s*\n+/.exec(pendingText);
    while (match !== null && match.index !== undefined) {
      const paragraphText = pendingText.slice(0, match.index);
      pendingText = pendingText.slice(match.index + match[0].length);
      // Get citation keys that appear in THIS paragraph
      const keysInParagraph = getCitationKeysInText(paragraphText);
      pushParagraph(paragraphText, true, keysInParagraph);
      match = /\n\s*\n+/.exec(pendingText);
    }
  };

  const flushRemainingText = (): void => {
    if (pendingText.trim().length > 0) {
      const keysInParagraph = getCitationKeysInText(pendingText);
      pushParagraph(pendingText, true, keysInParagraph);
      pendingText = '';
    }
  };

  const flushReasoning = (currentPartIndex: number): void => {
    if (!pendingReasoning) return;
    const hasContent =
      pendingReasoning.entries.length > 0 || pendingReasoning.hasStreaming;
    const hasText = pendingReasoning.entries.some(
      (e) => e.kind === 'text' && e.text.trim().length > 0,
    );
    if (!hasContent && !hasText) {
      pendingReasoning = null;
      return;
    }

    flushByBlankLines();
    flushRemainingText();

    const remainingParts = message.parts.slice(currentPartIndex);
    const hasLaterText = remainingParts.some(
      (p) => isTextPart(p) && p.text.trim().length > 0,
    );
    const isLastReasoning = !remainingParts.some(isReasoningPart);
    const endIndex =
      pendingReasoning.startIndex + pendingReasoning.reasoningCount - 1;

    blocks.push({
      kind: 'node',
      key: `${message.id}:reasoning:${pendingReasoning.startIndex}`,
      node: (
        <ReasoningBlock
          messageId={message.id}
          partIndex={pendingReasoning.startIndex}
          entries={pendingReasoning.entries}
          state={pendingReasoning.hasStreaming ? 'streaming' : undefined}
          isActive={isStreaming && isLastReasoning && !hasLaterText}
          isMemoryUpdating={isLastReasoning && isMemoryUpdating}
          timingMs={getReasoningTimingMs(
            message,
            pendingReasoning.startIndex,
            endIndex,
            isStreaming,
          )}
        />
      ),
    });
    pendingReasoning = null;
  };

  for (let partIndex = 0; partIndex < message.parts.length; partIndex++) {
    const part = message.parts[partIndex];

    if (isReasoningPart(part)) {
      if (part.text.trim().length > 0 || part.state === 'streaming') {
        if (!pendingReasoning) {
          pendingReasoning = {
            entries: [],
            reasoningCount: 0,
            startIndex: reasoningIndex,
            hasStreaming: false,
          };
        }
        pendingReasoning.entries.push({ kind: 'text', text: part.text });
        pendingReasoning.reasoningCount++;
        if (part.state === 'streaming') pendingReasoning.hasStreaming = true;
        reasoningIndex++;
      }
      continue;
    }

    // Extract tool actions from bash tool-call parts and interleave with reasoning
    if (isToolUIPart(part) && getToolName(part) === 'bash') {
      const partAny = part as unknown as {
        input?: { command?: string };
        output?: unknown;
        state?: string;
      };

      // tool-call: extract actions from command
      const command = partAny.input?.command ?? '';
      if (command) {
        const actions = parseBashToolActions(command);
        allToolActions.push(...actions);
        if (pendingReasoning) {
          for (const action of actions) {
            pendingReasoning.entries.push({ kind: 'action', action });
          }
        }
      }

      // tool output: extract biomarker badges from FHIR Observation results
      if (partAny.output != null && pendingReasoning) {
        const outputStr =
          typeof partAny.output === 'string'
            ? partAny.output
            : typeof (partAny.output as Record<string, unknown>)?.stdout ===
                'string'
              ? ((partAny.output as Record<string, unknown>).stdout as string)
              : null;
        if (outputStr != null) {
          try {
            const json: unknown = JSON.parse(outputStr);
            const badges = extractBiomarkersFromFhirJson(json);
            if (badges.length > 0) {
              pendingReasoning.entries.push({
                kind: 'biomarkers',
                items: badges,
              });
            }
          } catch {
            // Not JSON — skip
          }
        }
      }

      continue;
    }

    // step-start and non-bash tool parts don't flush reasoning,
    // allowing consecutive reasoning blocks to merge into one.
    if (isStepStartPart(part) || isToolUIPart(part)) {
      flushByBlankLines();
      flushRemainingText();
      continue;
    }

    // Visible content (text, sources, files, data) flushes reasoning
    // so each reasoning block appears before its corresponding response.
    flushReasoning(partIndex);

    if (isTextPart(part)) {
      // Extract citations from markdown links in real-time (not just when done)
      const extracted = extractCitationsFromMarkdown(
        part.text,
        citations,
        nextCitationNumber,
      );

      // Update citations map and next number
      for (const [key, info] of extracted.citations) {
        if (!citations.has(key)) {
          citations.set(key, info);
        }
      }
      nextCitationNumber = extracted.nextNumber;

      // Transform citation links to markers for rendering (always, not just when done)
      const textToAppend = transformCitationLinksToMarkers(
        part.text,
        citations,
        message.id,
      );

      pendingText += textToAppend;
      pendingTextStreaming = isStreaming && part.state === 'streaming';
      flushByBlankLines();
      continue;
    }

    const partWithType = part as {
      type: string;
      url?: string;
      title?: string;
      mediaType?: string;
      data?: unknown;
    };

    if (partWithType.type === 'source-url') {
      flushByBlankLines();
      flushRemainingText();
      blocks.push({
        kind: 'node',
        key: `${message.id}:source-url:${partIndex}`,
        node: (
          <MetadataBlock
            messageId={message.id}
            partIndex={partIndex}
            variant={{
              type: 'source-url',
              url: partWithType.url ?? '',
              title: partWithType.title,
            }}
          />
        ),
      });
      continue;
    }

    if (partWithType.type === 'source-document') {
      flushByBlankLines();
      flushRemainingText();
      blocks.push({
        kind: 'node',
        key: `${message.id}:source-document:${partIndex}`,
        node: (
          <MetadataBlock
            messageId={message.id}
            partIndex={partIndex}
            variant={{
              type: 'source-document',
              title: partWithType.title ?? '',
              mediaType: partWithType.mediaType ?? '',
            }}
          />
        ),
      });
      continue;
    }

    if (partWithType.type === 'file') {
      flushByBlankLines();
      flushRemainingText();
      blocks.push({
        kind: 'node',
        key: `${message.id}:file:${partIndex}`,
        node: (
          <MetadataBlock
            messageId={message.id}
            partIndex={partIndex}
            variant={{
              type: 'file',
              mediaType: partWithType.mediaType ?? '',
              url: partWithType.url ?? '',
            }}
          />
        ),
      });
      continue;
    }

    if (isDataPart(part)) {
      // Internal-only data parts that should not be rendered.
      if (part.type === 'data-recalled-memories') continue;

      flushByBlankLines();
      flushRemainingText();
      if (isFileIngestionDataPart(part)) {
        // Collect all ingestion parts and render a single aggregated block
        if (!fileIngestionBlockAdded) {
          fileIngestionBlockAdded = true;
          const allIngestionParts = message.parts.filter(
            isFileIngestionDataPart,
          );
          blocks.push({
            kind: 'node',
            key: `${message.id}:file-ingestion`,
            node: <FileIngestionBlock parts={allIngestionParts} />,
          });
        }
      } else if (isCompactionDataPart(part)) {
        // Collect all compaction parts and render a single aggregated block
        if (!compactionBlockAdded) {
          compactionBlockAdded = true;
          const allCompactionParts = message.parts.filter(isCompactionDataPart);
          blocks.push({
            kind: 'node',
            key: `${message.id}:compaction`,
            node: <CompactionBlock parts={allCompactionParts} />,
          });
        }
      } else {
        blocks.push({
          kind: 'node',
          key: `${message.id}:data:${partIndex}`,
          node: (
            <MetadataBlock
              messageId={message.id}
              partIndex={partIndex}
              variant={{
                type: 'data',
                dataType: part.type,
                dataText: safeJsonStringify(part.data),
              }}
            />
          ),
        });
      }
      continue;
    }
  }

  flushReasoning(message.parts.length);
  flushByBlankLines();
  if (pendingText.trim().length > 0) {
    const lastParagraphDone = !isStreaming;
    const keysInParagraph = getCitationKeysInText(pendingText);
    pushParagraph(pendingText, lastParagraphDone, keysInParagraph);
  }

  return { blocks, citations, toolActions: allToolActions };
}
