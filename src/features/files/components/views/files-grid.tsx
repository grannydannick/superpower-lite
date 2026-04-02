import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body3 } from '@/components/ui/typography';
import { FILE_CLASSIFICATION_LABELS } from '@/features/files/const/extraction-labels';
import { File } from '@/types/api';

import { CONTENT_TYPE_MAP } from '../../const/content-type';
import { PdfPreviewTrigger } from '../file-dialogs/pdf-preview-trigger';
import { ExtractionBadge } from '../patterns/extraction-badge';
import { ExtractionSummary } from '../patterns/extraction-summary';
import { FileDropdown } from '../patterns/file-dropdown';
import { FileImage } from '../patterns/file-image';
import { FilesNotFound } from '../patterns/files-not-found';
import { LabSummaryLink } from '../patterns/lab-summary-link';

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
        const extraction = file.ingestion?.extraction;
        const typeLabel =
          file.ingestion?.classification != null
            ? FILE_CLASSIFICATION_LABELS[file.ingestion.classification]
            : (CONTENT_TYPE_MAP[file.contentType] ?? 'Document');

        const content = (
          <div className="h-48 w-full overflow-hidden rounded-[20px] bg-white p-4 duration-500 animate-in fade-in md:h-64">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <Body1 className="mb-0.5 line-clamp-1">{file.name}</Body1>
                <Body3 className="mb-1 text-zinc-400">
                  {format(file.uploadedAt, 'MMM d, yyyy')}
                </Body3>
                <Body3 className="mb-1 text-zinc-500">{typeLabel}</Body3>
                <ExtractionBadge extraction={extraction} />
                {extraction?.status === 'final' ? (
                  <div className="mt-1">
                    <ExtractionSummary extraction={extraction} />
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <LabSummaryLink
                  file={file}
                  className="relative z-10 rounded-[10px] p-2 text-zinc-500 transition-all duration-300 hover:bg-white hover:text-zinc-700 hover:shadow-sm hover:ring-1 hover:ring-zinc-200"
                />
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
            <PdfPreviewTrigger key={file.id} fileId={file.id}>
              <button
                className="cursor-pointer rounded-[20px] text-left"
                type="button"
              >
                {content}
              </button>
            </PdfPreviewTrigger>
          );
        }

        return <div key={file.id}>{content}</div>;
      })}
    </div>
  );
}
