import type { FileUIPart } from 'ai';
import { FileIcon, ImageIcon, LoaderCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';
import { useOpenFile } from '@/features/files/hooks/use-open-file';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
}: {
  attachment: FileUIPart;
  isUploading?: boolean;
  onRemove?: () => void;
}) => {
  const { filename, url, mediaType } = attachment;
  const type = mediaType?.replace('application/', '');
  const openFile = useOpenFile();
  let fileId: string | null = null;
  if (url.startsWith('/files/')) {
    const nextFileId = url.slice('/files/'.length);
    if (nextFileId.length > 0) {
      fileId = nextFileId;
    }
  }
  const isClickable = !isUploading && onRemove === undefined && fileId !== null;
  const previewContent = (
    <>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="absolute -right-2 -top-2 rounded-full border-[3px] border-white bg-black p-1 text-white hover:bg-zinc-800 hover:text-white"
        >
          <X className="size-3 shrink-0" strokeWidth={2.5} />
        </Button>
      )}
      <div className="flex shrink-0 items-center justify-center pt-1.5">
        {isUploading ? (
          <Loader />
        ) : mediaType?.startsWith('image') ? (
          <ImageIcon className="size-8 shrink-0 text-zinc-500" />
        ) : mediaType?.startsWith('application/pdf') ? (
          <img
            src="/data/file-fallback.webp"
            alt=""
            className="h-10 w-auto object-contain"
          />
        ) : (
          <FileIcon className="size-8 shrink-0 text-zinc-500" />
        )}
      </div>
      <div className="min-w-0">
        <Body2 className="truncate">{filename}</Body2>
        <Body2 className="truncate uppercase text-zinc-500">{type}</Body2>
      </div>
    </>
  );

  return (
    <div className="ml-auto flex flex-col gap-2 duration-500 animate-in">
      {isClickable ? (
        <button
          type="button"
          className="relative flex h-14 max-w-64 items-center gap-2.5 rounded-lg bg-zinc-100 py-2 pl-2.5 pr-4 text-left"
          onClick={() => {
            if (fileId === null) return;
            openFile(fileId, { contentType: mediaType });
          }}
        >
          {previewContent}
        </button>
      ) : (
        <div className="relative flex h-14 max-w-64 items-center gap-2.5 rounded-lg bg-zinc-100 py-2 pl-2.5 pr-4">
          {previewContent}
        </div>
      )}
    </div>
  );
};

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <LoaderCircle className="size-4 animate-spin text-zinc-500" />
    </div>
  );
};
