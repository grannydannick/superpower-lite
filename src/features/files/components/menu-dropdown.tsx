import { ReactNode } from 'react';

import { AlertDialog, AlertDialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { useDownloadFile } from '@/features/files/api/download-file';
import { ConfirmDelete } from '@/features/files/components/confirm-delete';
import { ViewPdfDialog } from '@/features/files/components/view-pdf-dialog';
import { downloadBlob } from '@/features/files/utils/download-blob';
import { File } from '@/types/api';

interface MenuDropdownProps {
  children: ReactNode;
  file: File;
}

export function MenuDropdown({
  children,
  file,
}: MenuDropdownProps): JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] rounded-[16px] border-none"
      >
        <DownloadMenuItem {...file} />
        {file.contentType === 'application/pdf' ? (
          <ViewPdfDialog file={file}>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
              }}
            >
              View
            </DropdownMenuItem>
          </ViewPdfDialog>
        ) : null}
        <DeleteMenuItem {...file} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DownloadMenuItem({ id, name }: File): JSX.Element {
  const { mutateAsync } = useDownloadFile();

  const onClick = async (): Promise<void> => {
    const blob = await mutateAsync({ fileId: id });

    downloadBlob(blob, name);
  };

  return <DropdownMenuItem onClick={onClick}>Download</DropdownMenuItem>;
}

function DeleteMenuItem({ id }: File): JSX.Element {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
          }}
          className="cursor-pointer text-pink-700 focus:bg-pink-50 focus:text-pink-700"
        >
          Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <ConfirmDelete fileId={id} />
    </AlertDialog>
  );
}
