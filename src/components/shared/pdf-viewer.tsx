import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import { useResizeObserver } from '@wojtekmaj/react-hooks';
import { Download, X } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Body1, Body2 } from '@/components/ui/typography';

interface PdfViewerProps {
  url?: string;
  name: string;
  fileBlob?: Blob;
  showDownload?: boolean;
  showClose?: boolean;
  onDownload?: () => void;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const resizeObserverOptions = {};
const maxWidth = 800;

export const PdfViewer = ({
  url,
  name,
  fileBlob,
  showDownload = true,
  showClose = true,
  onDownload,
}: PdfViewerProps) => {
  const [file, setFile] = useState<Blob | undefined>(fileBlob);
  const [numPages, setNumPages] = useState<number | undefined>(undefined);
  const [isFirstPageRendered, setIsFirstPageRendered] = useState(false);
  const [pdfTitle, setPdfTitle] = useState<string>(
    name ?? 'Loading document...',
  );
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const firstPageRenderedRef = useRef(false);

  const onDocumentLoadSuccess = async (
    pdf: PDFDocumentProxy,
  ): Promise<void> => {
    const { numPages: nextNumPages } = pdf;
    setNumPages(nextNumPages);
    setIsFirstPageRendered(false);
    firstPageRenderedRef.current = false;

    try {
      const metadata = await pdf.getMetadata();
      const title = (metadata?.info as any)?.Title;
      if (title && title.trim()) {
        setPdfTitle(title.trim());
      }
    } catch (error) {
      console.warn('Failed to extract PDF metadata:', error);
    }
  };

  const onFirstPageRenderSuccess = useCallback(() => {
    if (!firstPageRenderedRef.current) {
      firstPageRenderedRef.current = true;
      setIsFirstPageRendered(true);
    }
  }, []);

  const handleDownload = (): void => {
    if (onDownload) {
      onDownload();
    } else if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfTitle;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  useEffect(() => {
    const loadPdf = async (): Promise<void> => {
      if (fileBlob) {
        setFile(fileBlob);
      } else if (url) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const blob = await response.blob();
            setFile(blob);
          }
        } catch (error) {
          console.error('Failed to load PDF:', error);
        }
      }
    };

    loadPdf();
  }, [url, fileBlob]);

  if (!url && !fileBlob) {
    return (
      <div className="flex items-center justify-center p-8">
        <Body1 className="text-zinc-500">No PDF specified</Body1>
      </div>
    );
  }

  return (
    <div
      ref={setContainerRef}
      className="relative gap-0 overflow-y-scroll scrollbar scrollbar-track-zinc-100 scrollbar-thumb-zinc-300"
    >
      {(showDownload || showClose) && (
        <div className="sticky top-0 z-10 ml-auto flex items-center justify-between gap-2 border-b border-b-zinc-200 bg-white py-1 pl-5 pr-3">
          <Body2 className="text-zinc-500">{pdfTitle}</Body2>
          <div className="flex items-center gap-1">
            {showDownload && (
              <div
                role="presentation"
                onClick={handleDownload}
                className="cursor-pointer rounded-md p-1.5 opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-zinc-100 hover:opacity-100 focus:outline-none disabled:pointer-events-none"
              >
                <Download className="size-4" />
              </div>
            )}
            {showClose && (
              <DialogClose className="rounded-md p-1.5 opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-zinc-100 hover:opacity-100 focus:outline-none disabled:pointer-events-none">
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            )}
          </div>
        </div>
      )}
      {numPages && <hr />}

      {!isFirstPageRendered && <Loader />}

      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(error) => {
          console.log(error);
        }}
        noData={<Loader />}
        loading={<Loader />}
        error={<ErrorDisplay />}
        className="-mt-px"
      >
        {Array.from(new Array(numPages), (el, index) => {
          const pageNumber = index + 1;
          const isFirstPage = pageNumber === 1;

          return (
            <Page
              key={`page_${pageNumber}`}
              pageNumber={pageNumber}
              width={
                containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
              }
              onRenderSuccess={
                isFirstPage ? onFirstPageRenderSuccess : undefined
              }
              onRenderError={(error) => {
                console.warn(`Failed to render page ${pageNumber}:`, error);
              }}
            >
              <div className="flex w-full justify-end p-3">
                <Body1 className="rounded-lg border border-dashed border-zinc-200 p-2 text-vermillion-700">
                  Page {pageNumber}/{numPages}
                </Body1>
              </div>
              {pageNumber !== numPages ? <Separator /> : null}
            </Page>
          );
        })}
      </Document>
    </div>
  );
};

const Loader = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center p-4">
      <Skeleton className="h-screen w-full" />
    </div>
  );
};

const ErrorDisplay = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center">
      <h3>Failed to load your PDF 😢</h3>
    </div>
  );
};
