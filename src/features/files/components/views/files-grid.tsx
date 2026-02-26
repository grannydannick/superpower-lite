import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body3 } from '@/components/ui/typography';
import { File } from '@/types/api';

import { ViewPdfDialog } from '../file-dialogs/view-pdf-dialog';
import { FileDropdown } from '../patterns/file-dropdown';
import { FileImage } from '../patterns/file-image';
import { FilesNotFound } from '../patterns/files-not-found';

/**
 * FilesGrid is a grid view of user health records
 *
 * It displays a 4 column grid of files on desktop and a 2 column grid on mobile
 */
export function FilesGrid({
  files,
  isLoading,
}: {
  files: File[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="shimmer"
            className="h-72 w-full rounded-[20px]"
          />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return <FilesNotFound />;
  }

  return (
    <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {files.map((file) => {
        // content component saved as const to re-use in pdf dialog wrapper or in normal way
        const content = (
          <div className="h-48 w-full overflow-hidden rounded-[20px] bg-white p-4 duration-500 animate-in fade-in md:h-64">
            <div className="flex items-start justify-between">
              <div>
                <Body1 className="mb-0.5 line-clamp-1">{file.name}</Body1>
                <Body3 className="mb-2 text-zinc-400">
                  {format(file.uploadedAt, 'MMM d, yyyy')}
                </Body3>
              </div>
              <div className="flex items-center justify-end">
                <FileDropdown file={file}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative z-10 rounded-[10px] p-2 text-zinc-500 transition-all duration-300 data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-600 hover:bg-zinc-100 hover:text-zinc-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </FileDropdown>
              </div>
            </div>
            <div className="relative size-full">
              <FileImage file={file} />
            </div>
          </div>
        );

        if (file.contentType === 'application/pdf') {
          return (
            <ViewPdfDialog key={file.id} file={file}>
              <button
                className="cursor-pointer rounded-[20px] text-left"
                type="button"
              >
                {content}
              </button>
            </ViewPdfDialog>
          );
        }

        return <div key={file.id}>{content}</div>;
      })}
    </div>
  );
}
