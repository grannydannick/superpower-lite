import { memo } from 'react';

interface FileBlockProps {
  messageId: string;
  partIndex: number;
  mediaType: string;
  url: string;
}

export const FileBlock = memo(function FileBlock({
  messageId,
  partIndex,
  mediaType,
  url,
}: FileBlockProps) {
  return (
    <div
      key={`${messageId}:file:${partIndex}`}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
    >
      <div className="text-xs font-semibold text-zinc-500">File</div>
      <div className="mt-1 break-all font-mono text-[11px] text-zinc-400">
        {mediaType}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block break-all text-xs text-blue-600 underline underline-offset-2 hover:text-blue-700"
      >
        open
      </a>
    </div>
  );
});
