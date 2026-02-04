import type { UIMessage } from 'ai';

/**
 * Event types in ChatV2MessageMetadata.events
 */
type MetadataEventType =
  | 'reasoning-start'
  | 'reasoning-end'
  | 'tool-call'
  | 'tool-result'
  | 'tool-error'
  | 'tool-output-denied';

interface MetadataEvent {
  type?: MetadataEventType;
  at?: string;
  id?: string;
}

/**
 * Timing information extracted from message metadata events
 */
export interface TimingInfo {
  /** Thinking/reasoning duration in milliseconds */
  thinkingMs: number | null;
  /** Tool execution duration in milliseconds */
  toolsMs: number | null;
  /** Total response time in milliseconds */
  totalMs: number | null;
  /** Whether reasoning has completed */
  isComplete: boolean;
}

/**
 * Format duration in milliseconds to a human-readable string
 */
export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;

  const s = ms / 1000;
  if (s < 10) return `${s.toFixed(1)}s`;
  if (s < 60) return `${Math.round(s)}s`;

  const m = Math.floor(s / 60);
  const rs = Math.round(s % 60);
  if (m < 60) return `${m}m ${String(rs).padStart(2, '0')}s`;

  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${String(rm).padStart(2, '0')}m`;
}

/**
 * Extract timing information from message metadata events.
 *
 * The new backend sends events in message.metadata.events as:
 * {
 *   "1": { type: "reasoning-start", at: "2025-01-15T10:00:00Z" },
 *   "2": { type: "reasoning-end", at: "2025-01-15T10:00:05Z" },
 *   "3": { type: "tool-call", id: "tool_abc", at: "2025-01-15T10:00:06Z" },
 *   "4": { type: "tool-result", id: "tool_abc", at: "2025-01-15T10:00:08Z" }
 * }
 *
 * @param message - The UIMessage to extract timing from
 * @param isStreaming - Whether the message is still streaming
 * @param nowMs - Current time in milliseconds (for live updates during streaming)
 */
export function extractTiming(
  message: UIMessage,
  isStreaming: boolean,
  nowMs: number = Date.now(),
): TimingInfo {
  const meta = message.metadata as Record<string, unknown> | undefined;
  const events = meta?.events as Record<string, unknown> | undefined;

  if (!events || typeof events !== 'object') {
    return {
      thinkingMs: null,
      toolsMs: null,
      totalMs: null,
      isComplete: false,
    };
  }

  let thinkingStart: number | null = null;
  let thinkingEnd: number | null = null;
  let toolsStart: number | null = null;
  let toolsEnd: number | null = null;
  let totalStart: number | null = null;
  let totalEnd: number | null = null;

  const toolStartById = new Map<string, number>();
  const toolEndById = new Map<string, number>();

  // Process all events
  for (const ev of Object.values(events)) {
    if (!ev || typeof ev !== 'object' || Array.isArray(ev)) continue;

    const event = ev as MetadataEvent;
    const { type, at, id } = event;

    if (!type || !at) continue;

    const ms = Date.parse(at);
    if (!Number.isFinite(ms)) continue;

    // Track total range
    if (totalStart === null || ms < totalStart) totalStart = ms;
    if (totalEnd === null || ms > totalEnd) totalEnd = ms;

    switch (type) {
      case 'reasoning-start':
        if (thinkingStart === null || ms < thinkingStart) thinkingStart = ms;
        break;
      case 'reasoning-end':
        if (thinkingEnd === null || ms > thinkingEnd) thinkingEnd = ms;
        break;
      case 'tool-call':
        if (id) {
          const prev = toolStartById.get(id);
          if (prev === undefined || ms < prev) toolStartById.set(id, ms);
        }
        break;
      case 'tool-result':
      case 'tool-error':
      case 'tool-output-denied':
        if (id) {
          const prev = toolEndById.get(id);
          if (prev === undefined || ms > prev) toolEndById.set(id, ms);
        }
        break;
    }
  }

  // Calculate tools range
  for (const [id, startMs] of toolStartById) {
    if (toolsStart === null || startMs < toolsStart) toolsStart = startMs;
    const endMs = toolEndById.get(id);
    if (endMs !== undefined && (toolsEnd === null || endMs > toolsEnd)) {
      toolsEnd = endMs;
    }
  }

  // Calculate durations
  const effectiveNow = isStreaming ? nowMs : null;

  const thinkingMs =
    thinkingStart !== null
      ? (thinkingEnd ?? effectiveNow ?? thinkingStart) - thinkingStart
      : null;

  const toolsMs =
    toolsStart !== null
      ? (toolsEnd ?? effectiveNow ?? toolsStart) - toolsStart
      : null;

  const totalMs =
    totalStart !== null
      ? (totalEnd ?? effectiveNow ?? totalStart) - totalStart
      : null;

  return {
    thinkingMs,
    toolsMs,
    totalMs,
    isComplete: !isStreaming && thinkingEnd !== null,
  };
}

/**
 * Get combined timing (thinking + tools) for display in the thinking block.
 */
export function getCombinedTimingMs(timing: TimingInfo): number | null {
  const thinking = timing.thinkingMs ?? 0;
  const tools = timing.toolsMs ?? 0;
  const combined = thinking + tools;
  return combined > 0 ? combined : null;
}
