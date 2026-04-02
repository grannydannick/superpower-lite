import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useCallback } from 'react';
import * as z from 'zod';

import { PdfPreviewRouteHost } from '@/features/files/components/file-dialogs/pdf-preview-route-host';

const dataSearchSchema = z.object({
  category: z.string().optional(),
  modal: z
    .enum(['biological-age', 'superpower-score'])
    .optional()
    .catch(undefined),
  previewFileId: z.string().optional().catch(undefined),
});

export const Route = createFileRoute('/_app/data')({
  validateSearch: zodValidator(dataSearchSchema),
  component: DataLayout,
});

function DataLayout() {
  const navigate = Route.useNavigate();
  const previewFileId = Route.useSearch({ select: (s) => s.previewFileId });
  const { pathname, searchStr } = useLocation();

  const closePreview = useCallback(() => {
    const params = new URLSearchParams(searchStr);
    params.delete('previewFileId');
    void navigate({
      to: `${pathname}?${params.toString()}`,
    });
  }, [navigate, pathname, searchStr]);

  return (
    <PdfPreviewRouteHost
      previewFileId={previewFileId}
      closePreview={closePreview}
    >
      <Outlet />
    </PdfPreviewRouteHost>
  );
}
