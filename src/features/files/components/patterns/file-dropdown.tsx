import { useNavigate } from '@tanstack/react-router';
import React, { ReactNode, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { useDeleteFile } from '@/features/files/api/delete-file';
import { useDownloadFile } from '@/features/files/api/download-file';
import { PdfPreviewTrigger } from '@/features/files/components/file-dialogs/pdf-preview-trigger';
import { downloadBlob } from '@/features/files/utils/download-blob';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { File } from '@/types/api';

import { getLabSummaryState } from './lab-summary-link';

interface FileDropdownProps {
  children: ReactNode;
  file: File;
}

export function FileDropdown({ children, file }: FileDropdownProps) {
  // For now we don't have options for tests
  if (file.contentType === 'test') return null;

  const { summaryChatId, summaryMessageId, hasSummary, canGenerateSummary } =
    getLabSummaryState(file);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] rounded-[16px] border-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {hasSummary && summaryChatId != null && summaryMessageId != null && (
          <ViewLabSummaryMenuItem
            chatId={summaryChatId}
            messageId={summaryMessageId}
          />
        )}
        {canGenerateSummary && <GenerateLabSummaryMenuItem file={file} />}
        <DownloadMenuItem {...file} />
        {file.contentType === 'application/pdf' ? (
          <PdfPreviewTrigger fileId={file.id}>
            <DropdownMenuItem>View</DropdownMenuItem>
          </PdfPreviewTrigger>
        ) : null}
        <DeleteMenuItem {...file} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ViewLabSummaryMenuItem({
  chatId,
  messageId,
}: {
  chatId: string;
  messageId: string;
}) {
  const navigate = useNavigate();

  return (
    <DropdownMenuItem
      onClick={() => {
        navigate({
          to: '/concierge/$id',
          params: { id: chatId },
          search: { ctxMessageId: messageId },
        });
      }}
    >
      View Lab Summary
    </DropdownMenuItem>
  );
}

function GenerateLabSummaryMenuItem({ file }: { file: File }) {
  const navigate = useNavigate();

  return (
    <DropdownMenuItem
      onClick={() => {
        useChatStore.getState().setPendingFiles([
          {
            type: 'file',
            url: `/files/${file.id}`,
            filename: file.name,
            mediaType: file.contentType,
          },
        ]);
        void navigate({
          to: '/concierge',
          search: { autoSend: true },
        });
      }}
    >
      Generate Lab Summary
    </DropdownMenuItem>
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
