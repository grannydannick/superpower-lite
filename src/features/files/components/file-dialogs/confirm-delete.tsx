import React from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { AlertDialogContent, AlertDialogCancel } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useDeleteFile } from '@/features/files/api/delete-file';
import { useWindowDimensions } from '@/hooks/use-window-dimensions';

export function ConfirmDelete({ fileId }: { fileId: string }) {
  const { width } = useWindowDimensions();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useDeleteFile({
    mutationConfig: {
      onSuccess: () => {
        // redirect if called on mobile page
        width <= 768 && navigate('/vault');

        /**
         * @description
         * This hack addresses two specific issues when handling file deletion:
         *
         * 1. **PDF Viewer Handling**:
         *    If the file is opened in a PDF viewer, we need to close the PDF viewer after the file is deleted.
         *    Otherwise, the user could still see the file in the viewer, despite its deletion.
         *
         * 2. **dropdown and Dialog Closure without Refresh**:
         *    When this action is called without a screen refresh, the screen may freeze.
         *    This happens because the `DropdownMenuItem` is closed along with the dialog,
         *    but remains mounted in the DOM, which prevents scrolling on the page.
         *    Refreshing or properly unmounting the components avoids this issue.
         */
        window.location.reload();
      },
    },
  });

  const onFileDelete = async (fileId: string): Promise<void> => {
    await mutateAsync({ fileId });
  };

  return (
    <AlertDialogContent className="w-full max-w-[432px] space-y-8 p-8">
      <h1 className="text-center text-2xl text-[#18181B]">
        Are you sure you want to delete this file? This action cannot be undone.
      </h1>
      <div className="mx-auto flex w-full items-center justify-center gap-4">
        <AlertDialogCancel asChild>
          <Button variant="outline" className="px-8 py-4">
            Cancel
          </Button>
        </AlertDialogCancel>
        <Button
          className="text-nowrap px-8 py-4"
          onClick={() => onFileDelete(fileId)}
        >
          {isPending ? <Spinner /> : 'Confirm Delete'}
        </Button>
      </div>
    </AlertDialogContent>
  );
}
