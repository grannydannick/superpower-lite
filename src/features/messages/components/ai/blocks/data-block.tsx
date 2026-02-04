import { memo } from 'react';

interface DataBlockProps {
  messageId: string;
  partIndex: number;
  type: string;
  dataText: string;
}

export const DataBlock = memo(function DataBlock({
  messageId,
  partIndex,
  type,
  dataText,
}: DataBlockProps) {
  return (
    <div
      key={`${messageId}:data:${partIndex}`}
      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
    >
      <div className="text-xs font-semibold text-zinc-500">{type}</div>
      <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-700">
        {dataText}
      </pre>
    </div>
  );
});
