import { useLocation, useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

import { getFile } from '@/features/files/api/get-file';

export function useOpenFile() {
  const navigate = useNavigate();
  const { pathname, searchStr } = useLocation();

  return useCallback(
    (fileId: string, options?: { contentType?: string }) => {
      const shouldOpenInPreview =
        options?.contentType === 'application/pdf' &&
        (pathname.startsWith('/data') || pathname.startsWith('/concierge'));

      if (shouldOpenInPreview) {
        const params = new URLSearchParams(searchStr);
        params.set('previewFileId', fileId);
        void navigate({ to: `${pathname}?${params.toString()}` });
        return;
      }

      const nextWindow = window.open('', '_blank');

      getFile({ fileId })
        .then(({ file }) => {
          const shouldOpenFetchedFileInPreview =
            file.contentType === 'application/pdf' &&
            (pathname.startsWith('/data') || pathname.startsWith('/concierge'));

          if (shouldOpenFetchedFileInPreview) {
            const params = new URLSearchParams(searchStr);
            params.set('previewFileId', fileId);
            nextWindow?.close();
            void navigate({ to: `${pathname}?${params.toString()}` });
            return;
          }

          if (nextWindow != null) {
            nextWindow.location.href = file.presignedUrl;
            return;
          }

          window.open(file.presignedUrl, '_blank');
        })
        .catch(() => {
          nextWindow?.close();
        });
    },
    [navigate, pathname, searchStr],
  );
}
