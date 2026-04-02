import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PdfPreviewTrigger } from '@/features/files/components/file-dialogs/pdf-preview-trigger';
import { FILE_CLASSIFICATION_LABELS } from '@/features/files/const/extraction-labels';
import { cn } from '@/lib/utils';
import { File } from '@/types/api';

import { CONTENT_TYPE_MAP } from '../../const/content-type';
import { ExtractionBadge } from '../patterns/extraction-badge';
import { ExtractionSummary } from '../patterns/extraction-summary';
import { FileDropdown } from '../patterns/file-dropdown';
import { FileName } from '../patterns/file-name';
import { LabSummaryLink } from '../patterns/lab-summary-link';

export const columns: ColumnDef<File>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-sm hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          File
          <ChevronDown
            className={cn(
              `ml-0.5 size-[15px] transition-transform duration-300 ease-in-out`,
              column.getIsSorted() === 'asc' ? 'rotate-180' : '',
            )}
          />
        </Button>
      );
    },
    cell: ({ row }) => {
      if (row.original.contentType === 'application/pdf') {
        return (
          <PdfPreviewTrigger fileId={row.original.id}>
            <div className="flex w-full cursor-pointer items-center place-self-start md:max-w-[280px] lg:max-w-[400px] xl:max-w-none">
              <FileName file={row.original} />
            </div>
          </PdfPreviewTrigger>
        );
      }

      return (
        <div className="flex w-full items-center md:max-w-[280px] lg:max-w-[400px] xl:max-w-none">
          <FileName file={row.original} />
        </div>
      );
    },
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const { ingestion, contentType } = row.original;
      const type =
        ingestion?.classification != null
          ? FILE_CLASSIFICATION_LABELS[ingestion.classification]
          : (CONTENT_TYPE_MAP[contentType] ?? 'Document');

      return (
        <div className="hidden xl:table-cell">
          <span>{type}</span>
        </div>
      );
    },
  },
  {
    id: 'results',
    header: 'Results',
    cell: ({ row }) => {
      const extraction = row.original.ingestion?.extraction;

      if (extraction == null) {
        return <div className="hidden xl:table-cell" />;
      }

      if (extraction.status !== 'final') {
        return (
          <div className="hidden xl:table-cell">
            <ExtractionBadge extraction={extraction} className="w-fit" />
          </div>
        );
      }

      return (
        <div className="hidden xl:table-cell">
          <ExtractionSummary extraction={extraction} withTooltip />
        </div>
      );
    },
  },
  {
    accessorKey: 'uploadedAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-sm hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Upload Date
          <ChevronDown
            className={cn(
              `ml-0.5 size-[15px] transition-transform duration-300 ease-in-out`,
              column.getIsSorted() === 'asc' ? 'rotate-180' : '',
            )}
          />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>{format(new Date(row.original.uploadedAt), 'MMM d, yyyy')}</div>
      );
    },
  },
  {
    id: 'reportDate',
    accessorFn: (row) => row.ingestion?.extraction?.reportDate ?? '',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 text-sm hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Report Date
          <ChevronDown
            className={cn(
              `ml-0.5 size-[15px] transition-transform duration-300 ease-in-out`,
              column.getIsSorted() === 'asc' ? 'rotate-180' : '',
            )}
          />
        </Button>
      );
    },
    cell: ({ row }) => {
      const reportDate = row.original.ingestion?.extraction?.reportDate;

      if (reportDate == null) {
        return <span className="text-zinc-400">-</span>;
      }

      return <div>{format(new Date(reportDate), 'MMM d, yyyy')}</div>;
    },
  },
  {
    id: 'action',
    header: () => {
      return <div className="text-right"></div>;
    },
    cell: ({ row }) => {
      return (
        <div className="-mb-1 flex items-center justify-end gap-1">
          <LabSummaryLink
            file={row.original}
            className="-mt-1 rounded-lg p-2 text-zinc-500 transition-all hover:bg-white hover:text-zinc-700 hover:shadow-sm hover:ring-1 hover:ring-zinc-200"
          />
          <FileDropdown file={row.original}>
            <Button
              variant="ghost"
              size="icon"
              // -mt-1 class to offset the -mb-1 class on the parent to visually align the button with the other cells
              className="-mt-1 rounded-lg p-2 data-[state=open]:bg-zinc-100"
            >
              <MoreHorizontal className="size-4 text-zinc-500" />
              <span className="sr-only">Open menu</span>
            </Button>
          </FileDropdown>
        </div>
      );
    },
  },
];
