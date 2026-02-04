import { memo } from 'react';

interface SourceDocumentBlockProps {
  messageId: string;
  partIndex: number;
  title: string;
  mediaType: string;
}

export const SourceDocumentBlock = memo(function SourceDocumentBlock({
  messageId,
  partIndex,
  title,
  mediaType,
}: SourceDocumentBlockProps) {
  return (
    <div
      key={`${messageId}:source-document:${partIndex}`}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
    >
      <div className="text-xs font-semibold text-zinc-500">Source document</div>
      <div className="mt-1 break-all text-xs text-zinc-700">{title}</div>
      <div className="mt-1 break-all font-mono text-[11px] text-zinc-400">
        {mediaType}
      </div>
    </div>
  );
});
