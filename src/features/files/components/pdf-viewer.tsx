import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { Download, Trash2, X } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useCallback, useEffect, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

import {
  AlertDialog,
  AlertDialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1 } from '@/components/ui/typography';
import { useDownloadFile } from '@/features/files/api/download-file';
import { useGetFileUrl } from '@/features/files/api/get-file-url';
import { ConfirmDelete } from '@/features/files/components/confirm-delete';
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

export const PdfViewer = ({ id, name }: PdfViewerProps) => {
  const { data } = useGetFileUrl({ fileId: id });
  const [file, setFile] = useState<Blob | undefined>(undefined);
  const [numPages, setNumPages] = useState<number | undefined>(undefined);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const { mutateAsync } = useDownloadFile({
    mutationConfig: {
      onSuccess: (data) => {
        setFile(data);
      },
    },
  });

  const onDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void => {
    setNumPages(nextNumPages);
  };

  const onDownload = async (): Promise<void> => {
    const blob = await mutateAsync({ fileId: id });
    downloadBlob(blob, name);
  };

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  useEffect(() => {
    const url = data?.file.presignedUrl;

    const loadUrl = async (): Promise<void> => {
      if (url) {
        await mutateAsync({
          fileId: data.file.id,
        });
      }
    };

    loadUrl();
  }, [data?.file]);

  return (
    <div
      ref={setContainerRef}
      className="relative gap-0 overflow-y-scroll scrollbar scrollbar-track-vermillion-300 scrollbar-thumb-vermillion-700"
    >
      <div className="ml-auto flex items-start gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="cursor-pointer rounded-sm p-3 opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none disabled:pointer-events-none">
              <Trash2 className="size-5 md:size-6" color="#B90090" />
            </div>
          </AlertDialogTrigger>
          <ConfirmDelete fileId={id} />
        </AlertDialog>
        <div
          role="presentation"
          onClick={onDownload}
          className="cursor-pointer rounded-sm p-3 opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <Download className="size-5 md:size-6" />
        </div>
        <DialogClose className="rounded-sm p-3 opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none disabled:pointer-events-none">
          <X className="size-5 md:size-6" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </div>
      {numPages && <hr />}
      <Document
        file={file}
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

const Loader = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center">
      <Skeleton className="h-screen w-full" />
    </div>
  );
};

const Error = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center">
      <h3>Failed to load your PDF 😢</h3>
    </div>
  );
};
