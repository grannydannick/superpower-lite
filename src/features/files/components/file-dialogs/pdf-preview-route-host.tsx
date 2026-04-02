import { ReactNode } from 'react';

import { PdfPreviewDialog } from '@/features/files/components/file-dialogs/pdf-preview-dialog';

interface PdfPreviewRouteHostProps {
  children: ReactNode;
  previewFileId: string | undefined;
  closePreview: () => void;
}

export function PdfPreviewRouteHost({
  children,
  previewFileId,
  closePreview,
}: PdfPreviewRouteHostProps) {
  return (
    <>
      {children}
      <PdfPreviewDialog
        fileId={previewFileId}
        open={previewFileId != null}
        onOpenChange={(open) => {
          if (open) return;
          closePreview();
        }}
      />
    </>
  );
}
