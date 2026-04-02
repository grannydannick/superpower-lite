import { getToolName, isToolUIPart, type UIMessage } from 'ai';

import { FileIngestionBlock } from '../components/ai/blocks/file-ingestion-block';
import { MetadataBlock } from '../components/ai/blocks/metadata-block';
import { ReasoningBlock } from '../components/ai/blocks/reasoning-block';
import type {
  CitationInfo,
  ParsedBlock,
  ParsedMessageResult,
} from '../types/message-parts';

import { isFileIngestionDataPart } from './data-parts';
import { extractTiming, getCombinedTimingMs } from './extract-timing';
import { safeJsonStringify } from './json';
import {
  extractCitationsFromMarkdown,
  transformCitationLinksToMarkers,
} from './parse-citation-links';

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

  // Extract timing info from message metadata
  const timing = extractTiming(message, isStreaming);
  const combinedTimingMs = getCombinedTimingMs(timing);

  const blocks: ParsedBlock[] = [];

  // Collect all reasoning parts to combine into a single block
  const reasoningParts: Array<{ text: string; state?: string }> = [];
  for (const part of message.parts) {
    if (isReasoningPart(part)) {
      reasoningParts.push({ text: part.text, state: part.state });
    }
  }

  // Combine reasoning text and determine overall state
  const combinedReasoningText = reasoningParts.map((p) => p.text).join('\n\n');

  // Show "Thinking..." while message is streaming and there's no text content yet
  // This avoids flickering when reasoning parts finish one by one
  const hasTextContent = message.parts.some(
    (p) => isTextPart(p) && p.text.trim().length > 0,
  );
  const reasoningState =
    isStreaming && reasoningParts.length > 0 && !hasTextContent
      ? 'streaming'
      : undefined;
  let reasoningBlockAdded = false;
  let fileIngestionBlockAdded = false;

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

  for (let partIndex = 0; partIndex < message.parts.length; partIndex++) {
    const part = message.parts[partIndex];

    if (isStepStartPart(part)) {
      flushByBlankLines();
      flushRemainingText();
      continue;
    }

    if (isReasoningPart(part)) {
      // Add combined reasoning block only once (on first reasoning part)
      if (!reasoningBlockAdded && combinedReasoningText.trim().length > 0) {
        flushByBlankLines();
        flushRemainingText();
        blocks.push({
          kind: 'node',
          key: `${message.id}:reasoning:combined`,
          node: (
            <ReasoningBlock
              messageId={message.id}
              partIndex={0}
              text={combinedReasoningText}
              state={reasoningState}
              isMemoryUpdating={isMemoryUpdating}
              timingMs={combinedTimingMs}
            />
          ),
        });
        reasoningBlockAdded = true;
      }
      continue;
    }

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

  flushByBlankLines();
  if (pendingText.trim().length > 0) {
    const lastParagraphDone = !isStreaming;
    const keysInParagraph = getCitationKeysInText(pendingText);
    pushParagraph(pendingText, lastParagraphDone, keysInParagraph);
  }

  return { blocks, citations };
}
