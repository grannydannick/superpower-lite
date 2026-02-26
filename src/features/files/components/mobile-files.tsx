import { Reorder } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { FileName } from '@/features/files/components/patterns/file-name';
import { cn } from '@/lib/utils';
import { File } from '@/types/api';

import { ViewPdfDialog } from './file-dialogs/view-pdf-dialog';
import { FileDropdown } from './patterns/file-dropdown';

interface MobileFilesProps {
  files: File[];
}

export function MobileFiles({ files }: MobileFilesProps) {
  return (
    <div className="relative left-1/2 flex w-full -translate-x-1/2 flex-col justify-between rounded-[20px] bg-white sm:w-auto md:hidden">
      <div className="flex w-full flex-col justify-between">
        <div>
          <Reorder.Group
            onReorder={() => {}}
            axis="y"
            transition={{ duration: 0.2 }}
            values={files}
            className="space-y-1"
          >
            {files.map((file, index) => {
              return (
                <Reorder.Item
                  drag={false}
                  value={file.id}
                  className="px-5"
                  key={file.id}
                >
                  <div
                    className={cn(
                      'flex items-center border-b border-zinc-100 py-3',
                      index === files.length - 1 && 'border-b-0',
                    )}
                  >
                    {file.contentType === 'application/pdf' ? (
                      <ViewPdfDialog file={file}>
                        <div className="flex items-center">
                          <FileName file={file} />
                        </div>
                      </ViewPdfDialog>
                    ) : (
                      <FileName file={file} />
                    )}
                    <div className="ml-auto flex items-center gap-1.5">
                      <FileDropdown file={file}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                          className="rounded-lg p-2 data-[state=open]:bg-zinc-100"
                        >
                          <MoreHorizontal className="size-4 text-zinc-500" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </FileDropdown>
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>
      </div>
    </div>
  );
}
