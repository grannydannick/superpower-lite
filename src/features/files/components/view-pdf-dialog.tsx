import { ReactNode } from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PdfViewer } from '@/features/files/components/pdf-viewer';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';
import { File } from '@/types/api';

export const ViewPdfDialog = ({
  file,
  children,
}: {
  file: File;
  children: ReactNode;
}) => {
  const { id, name } = file;
  const { width } = useWindowDimensions();

  if (width <= 768) {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex max-h-full flex-col rounded-t-[10px]">
          <PdfViewer id={id} name={name} />
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-full max-h-[80%]">
        <PdfViewer id={id} name={name} />
      </DialogContent>
    </Dialog>
  );
};
