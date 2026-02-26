import React, { ReactNode, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { useDeleteFile } from '@/features/files/api/delete-file';
import { useDownloadFile } from '@/features/files/api/download-file';
import { ViewPdfDialog } from '@/features/files/components/file-dialogs/view-pdf-dialog';
import { downloadBlob } from '@/features/files/utils/download-blob';
import { File } from '@/types/api';

interface FileDropdownProps {
  children: ReactNode;
  file: File;
}

export function FileDropdown({ children, file }: FileDropdownProps) {
  // For now we don't have options for tests
  if (file.contentType === 'test') return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] rounded-[16px] border-zinc-100"
        onClick={(e) => e.stopPropagation()}
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

function DownloadMenuItem({ id, name }: File) {
  const { mutateAsync } = useDownloadFile();

  const onClick = async (): Promise<void> => {
    const blob = await mutateAsync({ fileId: id });

    downloadBlob(blob, name);
  };

  return <DropdownMenuItem onClick={onClick}>Download</DropdownMenuItem>;
}

function DeleteMenuItem({ id }: File) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { mutateAsync, isPending } = useDeleteFile({
    mutationConfig: {
      onSuccess: () => {
        // Show "Deleting..." for 500ms before resetting state
        setTimeout(() => {
          setIsConfirming(false);
        }, 500);
      },
      onError: () => {
        setIsConfirming(false);
      },
    },
  });

  const handleClick = async (event: React.MouseEvent): Promise<void> => {
    if (!isConfirming) {
      event.preventDefault();
      event.stopPropagation();
      setIsConfirming(true);
      return;
    }
    await mutateAsync({ fileId: id });
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      disabled={isPending}
      className="cursor-pointer text-pink-700 transition-all duration-200 ease-in-out focus:bg-pink-50 focus:text-pink-700"
    >
      <div className="relative">
        <span
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            isPending ? 'opacity-0' : isConfirming ? 'opacity-0' : 'opacity-100'
          }`}
        >
          Delete
        </span>
        <span
          className={`absolute inset-0 transition-opacity delay-300 duration-500 ease-in-out ${
            isPending ? 'opacity-0' : isConfirming ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Confirm
        </span>
        <span
          className={`transition-opacity delay-300 duration-500 ease-in-out ${
            isPending ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Deleting...
        </span>
      </div>
    </DropdownMenuItem>
  );
}
