import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { useGetFile } from '@/features/files/api/get-file';
import { PdfViewer } from '@/features/files/components/pdf-viewer';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export function PdfPreviewDialog({
  fileId,
  open,
  onOpenChange,
}: {
  fileId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { width } = useWindowDimensions();
  const fileQuery = useGetFile({
    fileId: fileId ?? '',
    queryConfig: {
      enabled: fileId != null,
    },
  });
  const fileName = fileQuery.data?.file.name ?? 'PDF document';

  if (fileId == null) {
    return null;
  }

  if (width <= 768) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <SheetTitle className="sr-only">{fileName}</SheetTitle>
          <SheetDescription className="sr-only">
            PDF document viewer.
          </SheetDescription>
          <PdfViewer id={fileId} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-full max-h-[calc(100vh-48px)]">
        <DialogTitle className="sr-only">{fileName}</DialogTitle>
        <DialogDescription className="sr-only">
          PDF document viewer.
        </DialogDescription>
        <PdfViewer id={fileId} />
      </DialogContent>
    </Dialog>
  );
}
