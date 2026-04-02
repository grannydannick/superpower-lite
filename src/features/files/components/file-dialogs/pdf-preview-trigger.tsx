import { useLocation, useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { Dialog, DialogTrigger } from '@/components/ui/dialog';

interface PdfPreviewTriggerProps {
  fileId: string;
  children: ReactNode;
}

export function PdfPreviewTrigger({
  fileId,
  children,
}: PdfPreviewTriggerProps) {
  const navigate = useNavigate();
  const { pathname, searchStr } = useLocation();

  return (
    <Dialog
      open={false}
      onOpenChange={(open) => {
        if (open === false) return;
        const params = new URLSearchParams(searchStr);
        params.set('previewFileId', fileId);
        void navigate({ to: `${pathname}?${params.toString()}` });
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
    </Dialog>
  );
}
