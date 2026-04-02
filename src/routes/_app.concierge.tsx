import { createFileRoute, useLocation } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useCallback } from 'react';
import * as z from 'zod';

import { PdfPreviewRouteHost } from '@/features/files/components/file-dialogs/pdf-preview-route-host';
import { chatPresetSchema } from '@/features/messages/components/ai/preset-messages';
import { ConciergeLayout } from '@/features/messages/layouts/concierge-layout';

const conciergeSearchSchema = z.object({
  defaultMessage: z.string().optional(),
  preset: chatPresetSchema.optional().catch(undefined),
  ctxMessageId: z.string().optional(),
  previewFileId: z.string().optional().catch(undefined),
  autoSend: z.boolean().optional(),
});

export const Route = createFileRoute('/_app/concierge')({
  validateSearch: zodValidator(conciergeSearchSchema),
  component: ConciergeRouteComponent,
});

function ConciergeRouteComponent() {
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
      <ConciergeLayout />
    </PdfPreviewRouteHost>
  );
}
