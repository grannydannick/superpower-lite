import { memo } from 'react';

type MetadataBlockVariant =
  | { type: 'data'; dataType: string; dataText: string }
  | { type: 'file'; mediaType: string; url: string }
  | { type: 'source-document'; title: string; mediaType: string }
  | { type: 'source-url'; url: string; title?: string };

interface MetadataBlockProps {
  messageId: string;
  partIndex: number;
  variant: MetadataBlockVariant;
}

export const MetadataBlock = memo(function MetadataBlock({
  messageId,
  partIndex,
  variant,
}: MetadataBlockProps) {
  const key = `${messageId}:${variant.type}:${partIndex}`;

  switch (variant.type) {
    case 'data':
      return (
        <div
          key={key}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
        >
          <div className="text-xs font-semibold text-zinc-500">
            {variant.dataType}
          </div>
          <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-700">
            {variant.dataText}
          </pre>
        </div>
      );

    case 'file':
      return (
        <div
          key={key}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
        >
          <div className="text-xs font-semibold text-zinc-500">File</div>
          <div className="mt-1 break-all font-mono text-[11px] text-zinc-400">
            {variant.mediaType}
          </div>
          <a
            href={variant.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-all text-xs text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            open
          </a>
        </div>
      );

    case 'source-document':
      return (
        <div
          key={key}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
        >
          <div className="text-xs font-semibold text-zinc-500">
            Source document
          </div>
          <div className="mt-1 break-all text-xs text-zinc-700">
            {variant.title}
          </div>
          <div className="mt-1 break-all font-mono text-[11px] text-zinc-400">
            {variant.mediaType}
          </div>
        </div>
      );

    case 'source-url':
      return (
        <div
          key={key}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
        >
          <div className="text-xs font-semibold text-zinc-500">Source</div>
          <a
            href={variant.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-all text-xs text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            {variant.title ?? variant.url}
          </a>
        </div>
      );
  }
});
