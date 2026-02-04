import { ChevronRight } from 'lucide-react';
import { memo } from 'react';

/**
 * Displays tool call details in an expandable accordion.
 *
 * Shows tool name, execution status (pending/running/done/error),
 * input parameters, and output results.
 *
 * NOTE: Currently unused. Reserved for future use when we want to
 * expose tool calls (e.g., memory_update, search) in the chat UI.
 * To enable, add handling in parse-message-parts.tsx for tool parts.
 */
interface ToolCallBlockProps {
  messageId: string;
  toolCallId: string;
  toolName: string;
  state: string;
  inputText: string;
  outputText: string;
  hasOutput: boolean;
  errorText?: string;
}

export const ToolCallBlock = memo(function ToolCallBlock({
  messageId,
  toolCallId,
  toolName,
  state,
  inputText,
  outputText,
  hasOutput,
  errorText,
}: ToolCallBlockProps) {
  const hasError = typeof errorText === 'string' && errorText.length > 0;

  const statusText = hasError
    ? 'error'
    : hasOutput
      ? 'done'
      : state === 'input-available'
        ? 'running'
        : 'pending';

  const statusColor = hasError
    ? 'text-red-500'
    : hasOutput
      ? 'text-zinc-400'
      : 'text-blue-500';

  return (
    <details
      key={`${messageId}:tool:${toolCallId}`}
      className="group text-[11px]"
    >
      <summary className="flex cursor-pointer select-none items-center gap-1.5 py-0.5 font-mono text-zinc-500 hover:text-zinc-700">
        <ChevronRight className="size-3 shrink-0 transition-transform group-open:rotate-90" />
        <span className="font-semibold text-zinc-700">{toolName}</span>
        <span className="text-zinc-400">→</span>
        <span className={statusColor}>{statusText}</span>
        {hasError && errorText ? (
          <span className="ml-1 truncate text-red-500">
            ({errorText.slice(0, 50)})
          </span>
        ) : null}
      </summary>
      <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-zinc-200 pl-3">
        <div className="text-[10px] text-zinc-400">id: {toolCallId}</div>
        <div>
          <div className="text-[10px] font-semibold text-zinc-400">input</div>
          <pre className="mt-0.5 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 px-2 py-1 text-[10px] text-zinc-700">
            {inputText.length > 0 ? inputText : '—'}
          </pre>
        </div>
        {hasOutput || hasError ? (
          <div>
            <div className="text-[10px] font-semibold text-zinc-400">
              output
            </div>
            {hasError && errorText ? (
              <pre className="mt-0.5 whitespace-pre-wrap rounded bg-red-50 px-2 py-1 text-[10px] text-red-600">
                {errorText}
              </pre>
            ) : (
              <pre className="mt-0.5 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 px-2 py-1 text-[10px] text-zinc-700">
                {outputText.length > 0 ? outputText : '—'}
              </pre>
            )}
          </div>
        ) : (
          <div className="text-[10px] italic text-zinc-400">
            awaiting output…
          </div>
        )}
      </div>
    </details>
  );
});
