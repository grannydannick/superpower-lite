import { Reorder } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Body3 } from '@/components/ui/typography';
import { FileName } from '@/features/files/components/patterns/file-name';
import { FILE_CLASSIFICATION_LABELS } from '@/features/files/const/extraction-labels';
import { cn } from '@/lib/utils';
import { File } from '@/types/api';

import { CONTENT_TYPE_MAP } from '../const/content-type';

import { PdfPreviewTrigger } from './file-dialogs/pdf-preview-trigger';
import { ExtractionBadge } from './patterns/extraction-badge';
import { ExtractionSummary } from './patterns/extraction-summary';
import { FileDropdown } from './patterns/file-dropdown';
import { LabSummaryLink } from './patterns/lab-summary-link';

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
              const extraction = file.ingestion?.extraction;
              const typeLabel =
                file.ingestion?.classification != null
                  ? FILE_CLASSIFICATION_LABELS[file.ingestion.classification]
                  : (CONTENT_TYPE_MAP[file.contentType] ?? 'Document');

              const fileDetails = (
                <div className="min-w-0">
                  <FileName file={file} />
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Body3 className="text-zinc-500">{typeLabel}</Body3>
                    <ExtractionBadge extraction={extraction} />
                    {extraction?.status === 'final' ? (
                      <ExtractionSummary extraction={extraction} />
                    ) : null}
                  </div>
                </div>
              );

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
                      <PdfPreviewTrigger fileId={file.id}>
                        {fileDetails}
                      </PdfPreviewTrigger>
                    ) : (
                      fileDetails
                    )}
                    <div className="ml-auto flex shrink-0 items-center gap-1.5">
                      <LabSummaryLink file={file} />
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
