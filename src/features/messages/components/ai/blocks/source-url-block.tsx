import { memo } from 'react';

interface SourceUrlBlockProps {
  messageId: string;
  partIndex: number;
  url: string;
  title?: string;
}

export const SourceUrlBlock = memo(function SourceUrlBlock({
  messageId,
  partIndex,
  url,
  title,
}: SourceUrlBlockProps) {
  return (
    <div
      key={`${messageId}:source-url:${partIndex}`}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
    >
      <div className="text-xs font-semibold text-zinc-500">Source</div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block break-all text-xs text-blue-600 underline underline-offset-2 hover:text-blue-700"
      >
        {title ?? url}
      </a>
    </div>
  );
});
