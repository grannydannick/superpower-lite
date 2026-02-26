import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { format } from 'date-fns';
import { Download, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Document, Page, pdfjs, type DocumentProps } from 'react-pdf';

import {
  AlertDialog,
  AlertDialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';
import { downloadFile } from '@/features/files/api/download-file';
import { useGetFile } from '@/features/files/api/get-file';
import { ConfirmDelete } from '@/features/files/components/file-dialogs/confirm-delete';
import { downloadBlob } from '@/features/files/utils/download-blob';

interface PdfViewerProps {
  id: string;
  name: string;
}
/*
 * This approach doesn't work with deploys as it can't find fake worker in build files
 *
 * pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
 *
 * We are going with CDN way for now
 * */
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const resizeObserverOptions = {};

const maxWidth = 800;

type DocumentLoadSuccessArg = Parameters<
  NonNullable<DocumentProps['onLoadSuccess']>
>[0];

export const PdfViewer = ({ id, name }: PdfViewerProps) => {
  const { data } = useGetFile({ fileId: id });
  const [numPages, setNumPages] = useState<number | undefined>(undefined);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onDocumentLoadSuccess = (pdf: DocumentLoadSuccessArg) => {
    setNumPages(pdf.numPages);
  };

  const onDownload = async (): Promise<void> => {
    const blob = await downloadFile({ fileId: id });
    downloadBlob(blob, name);
  };

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  return (
    <div
      ref={setContainerRef}
      className="relative gap-0 overflow-y-scroll p-4 pt-0 scrollbar scrollbar-track-transparent scrollbar-thumb-zinc-300"
    >
      <div className="sticky top-0 z-20 ml-auto flex items-center justify-between gap-4 bg-background/80 backdrop-blur-lg">
        <Body2 className="truncate">{data?.file.name}</Body2>
        <div className="ml-auto flex items-center justify-end gap-0">
          {data?.file && (
            <Body2 className="mr-4 text-zinc-500">
              {format(data.file.uploadedAt, 'MMM d, yyyy')}
            </Body2>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="cursor-pointer rounded-sm p-3 opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none disabled:pointer-events-none">
                <Trash2 className="size-5 md:size-5" />
              </div>
            </AlertDialogTrigger>
            <ConfirmDelete fileId={id} />
          </AlertDialog>
          <div
            role="presentation"
            onClick={onDownload}
            className="cursor-pointer rounded-sm p-3 opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none disabled:pointer-events-none"
          >
            <Download className="size-5 md:size-5" />
          </div>
          <DialogClose className="rounded-sm p-3 opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none disabled:pointer-events-none">
            <X className="size-5 md:size-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </div>
      {numPages && <hr />}
      <Document
        className="rounded-lg border border-zinc-200"
        file={data?.file.presignedUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => {
          console.log(error);
        }}
        noData={Loader}
        loading={Loader}
        error={Error}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
          >
            <div className="flex w-full justify-end p-3">
              <Body1 className="rounded-lg border border-dashed border-zinc-200 p-2 text-vermillion-700">
                Page {index + 1}/{numPages}
              </Body1>
            </div>
            {index + 1 !== numPages ? <Separator /> : null}
          </Page>
        ))}
      </Document>
    </div>
  );
};

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <Skeleton className="h-screen w-full" />
    </div>
  );
};

const Error = () => {
  return (
    <div className="flex items-center justify-center">
      <h3>Failed to load your PDF 😢</h3>
    </div>
  );
};
