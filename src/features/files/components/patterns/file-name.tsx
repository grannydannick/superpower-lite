import { format } from 'date-fns';
import React from 'react';

import {
  CsvFileIcon,
  Mp4FileIcon,
  PdfFileIcon,
  UnknownFileIcon,
} from '@/components/icons';
import { ImageFileIcon } from '@/components/icons/image-file-icon';
import { Body1, Body3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { File } from '@/types/api';

export function FileName({ file }: { file: File }) {
  const extension = () => {
    // Otherwise we display the file icon
    switch (file.contentType) {
      case 'application/pdf':
        return <PdfFileIcon className="size-full" />;
      case 'text/csv':
        return <CsvFileIcon className="size-full" />;
      case 'video/mp4':
        return <Mp4FileIcon className="size-full" />;
      case 'image/jpeg':
        return <ImageFileIcon className="size-full" />;
      case 'image/png':
        return <ImageFileIcon className="size-full" />;
      // If tests has an image, we display the image
      case 'test':
        if (file.image) {
          return (
            <img
              src={file.image}
              alt={file.name}
              className="size-full rounded-sm object-cover"
            />
          );
        }
        return <UnknownFileIcon className="size-full" />;
      default:
        return <UnknownFileIcon className="size-full" />;
    }
  };

  return (
    <>
      <div className="size-6 shrink-0 md:size-4">{extension()}</div>
      <div className="ml-4 w-2/3 shrink">
        <Body1
          className={cn(
            'line-clamp-1',
            file.contentType === 'application/pdf'
              ? 'md:group-hover:text-vermillion-900'
              : null,
          )}
        >
          {file.name}
        </Body1>
        <Body3 className="whitespace-nowrap text-zinc-400 md:hidden">
          {format(file.uploadedAt, 'MMM d, yyyy')}
        </Body3>
      </div>
    </>
  );
}
