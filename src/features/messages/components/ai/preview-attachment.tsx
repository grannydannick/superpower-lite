import type { FileUIPart } from 'ai';
import { FileIcon, ImageIcon, LoaderCircle, X } from 'lucide-react';
import { Document } from 'react-pdf';

import { Button } from '@/components/ui/button';
import { Body2 } from '@/components/ui/typography';

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

  return (
    <div className="ml-auto flex flex-col gap-2 duration-500 animate-in">
      <div className="relative flex aspect-video h-14 w-36 items-center justify-center rounded-lg bg-zinc-100 py-2 pl-2.5 pr-4">
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="absolute -right-2 -top-2 rounded-full border-[3px] border-white bg-black p-1 text-white hover:bg-zinc-800 hover:text-white"
          >
            <X className="size-3 shrink-0" strokeWidth={2.5} />
          </Button>
        )}
        <div className="flex aspect-square flex-1 shrink-0 items-center justify-center">
          {isUploading ? (
            <Loader />
          ) : mediaType?.startsWith('image') ? (
            <ImageIcon className="size-4 shrink-0 text-zinc-500" />
          ) : mediaType?.startsWith('application/pdf') ? (
            <Document
              file={url}
              loading={<Loader />}
              error={<FileIcon className="size-4 shrink-0 text-zinc-500" />}
              className={'size-4'}
            />
          ) : (
            <FileIcon className="size-4 shrink-0 text-zinc-500" />
          )}
        </div>
        <div className="w-20">
          <Body2 className="line-clamp-1">{filename}</Body2>
          <Body2 className="line-clamp-1 uppercase text-zinc-500">{type}</Body2>
        </div>
      </div>
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
