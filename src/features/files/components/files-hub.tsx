import { useIsMutating } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { toast } from '@/components/ui/sonner';
import {
  acceptedFileContentTypes,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@/const';
import { FilesTable } from '@/features/files/components/views/files-table';
import { useChatStore } from '@/features/messages/stores/chat-store';
import { useAuthorization } from '@/lib/authorization';
import { File } from '@/types/api';

import { useFiles } from '../api/get-files';
import {
  useUploadFiles,
  UploadFilesResult,
  uploadFilesMutationKey,
} from '../api/upload-files';
import { MEDIA_TYPES, VIRTUAL_MEDIA_TYPE } from '../const/content-type';
import { getFileTypeName } from '../utils/get-file-type';

import { FileUploadButton } from './patterns/file-upload';
import { FilesEmpty } from './patterns/files-empty';
import { FilesFilter, type FilterType } from './patterns/files-filter';
import { FilesSearch } from './patterns/files-search';
import { ViewSwitch } from './view-switch';
import { FilesGrid } from './views/files-grid';

/**
 * FilesHub is called on both settings and vault pages
 *
 * It displays filters, sorting options, and grid + table views to find files
 */
export const FilesHub = ({ headerSlot }: { headerSlot?: React.ReactNode }) => {
  const { checkAdminActorAccess } = useAuthorization();
  const navigate = useNavigate();

  const onUploadSuccess = useCallback(
    (result: UploadFilesResult) => {
      if (result.uploaded.length === 0) return;

      if (checkAdminActorAccess()) return;

      useChatStore.getState().setPendingFiles(
        result.uploaded.map((f) => ({
          type: 'file' as const,
          url: `/files/${f.id}`,
          filename: f.name,
          mediaType: f.contentType,
        })),
      );
      void navigate({
        to: '/concierge',
        search: { preset: 'upload-labs', autoSend: true },
      });
    },
    [checkAdminActorAccess, navigate],
  );

  const { mutate } = useUploadFiles({
    mutationConfig: { onSuccess: onUploadSuccess },
  });
  const activeUploadCount = useIsMutating({
    exact: true,
    mutationKey: uploadFilesMutationKey,
  });

  const { data: filesData, isLoading: filesIsLoading } = useFiles();

  const isLoading = filesIsLoading;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<
    { name: string; type: FilterType } | false
  >(false);
  const [view, setView] = useState<'list' | 'grid'>('list');

  const { files } = filesData ?? { files: [] };
  let hasFilesProcessing = false;
  for (const file of files) {
    const extractionStatus = file.ingestion?.extraction?.status;
    if (
      extractionStatus === 'processing' ||
      extractionStatus === 'registered'
    ) {
      hasFilesProcessing = true;
      break;
    }
  }

  const isUploadDisabled = activeUploadCount > 0 || hasFilesProcessing;
  const uploadButtonStatus =
    activeUploadCount > 0
      ? 'uploading'
      : hasFilesProcessing
        ? 'processing'
        : 'idle';

  const { fileTypes, filteredFiles } = useMemo(() => {
    const allFiles: File[] = [...files];

    // map to group file types
    const typesMap = new Map<string, { name: string; type: FilterType }>();

    // Group types together
    allFiles.forEach((file) => {
      const isMediaType = MEDIA_TYPES.includes(file.contentType);
      const key = isMediaType ? VIRTUAL_MEDIA_TYPE : file.contentType;
      const typeName = getFileTypeName(file);
      typesMap.set(key, { name: typeName, type: key });
    });

    const fileTypes = Array.from(typesMap.values());

    // Add extraction status filters if relevant files exist
    const hasLabResults = allFiles.some(
      (f) => f.ingestion?.extraction?.status === 'final',
    );
    const hasProcessing = allFiles.some(
      (f) =>
        f.ingestion?.extraction?.status === 'processing' ||
        f.ingestion?.extraction?.status === 'registered',
    );

    if (hasLabResults) {
      fileTypes.push({ name: 'Lab Results', type: 'extraction:final' });
    }
    if (hasProcessing) {
      fileTypes.push({ name: 'Processing', type: 'extraction:processing' });
    }

    // filter files based on search and filter inputs
    const filteredFiles = allFiles.filter((file) => {
      const matchesSearch = search
        ? file.name.toLowerCase().includes(search.toLowerCase())
        : true;

      let matchesFilter = true;
      if (filter) {
        if (filter.type === VIRTUAL_MEDIA_TYPE) {
          matchesFilter = MEDIA_TYPES.includes(file.contentType);
        } else if (filter.type === 'extraction:final') {
          matchesFilter = file.ingestion?.extraction?.status === 'final';
        } else if (filter.type === 'extraction:processing') {
          matchesFilter =
            file.ingestion?.extraction?.status === 'processing' ||
            file.ingestion?.extraction?.status === 'registered';
        } else {
          matchesFilter = file.contentType === filter.type;
        }
      }

      return matchesSearch && matchesFilter;
    });

    return { fileTypes, filteredFiles };
  }, [files, search, filter]);

  const { getRootProps, isDragActive } = useDropzone({
    accept: acceptedFileContentTypes,
    disabled: isUploadDisabled,
    maxFiles: MAX_FILE_COUNT,
    maxSize: MAX_FILE_SIZE_BYTES,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      mutate({ data: { files: acceptedFiles } });
    },
    onDropRejected: (rejectedFiles) => {
      const hasTooManyFilesError = rejectedFiles.some(({ errors }) =>
        errors.some((error) => error.code === 'too-many-files'),
      );
      if (hasTooManyFilesError) {
        toast.error(
          `You can upload a maximum of ${MAX_FILE_COUNT} files at once.`,
        );
        return;
      }

      rejectedFiles.forEach(({ file, errors }) => {
        const sizeError = errors.find((e) => e.code === 'file-too-large');
        if (sizeError) {
          const sizeMB = Math.round(file.size / (1024 * 1024));
          toast.error(
            `"${file.name}" is too large (${sizeMB}MB). Maximum is ${MAX_FILE_SIZE_MB}MB.`,
          );
          return;
        }
        toast.error(`File type not supported: ${file.type}`);
      });
    },
    noClick: true,
    noDragEventsBubbling: true,
  });

  return (
    <div className="mx-auto">
      <div className="mb-4 flex w-full items-center justify-between gap-8">
        {headerSlot ?? <div />}
        <div className="relative">
          <FileUploadButton
            onUploadSuccess={onUploadSuccess}
            disabled={isUploadDisabled}
            status={uploadButtonStatus}
          />
        </div>
      </div>
      <div className="mx-auto mb-4 flex w-full flex-col justify-between gap-4 md:flex-row md:items-center">
        <FilesSearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center justify-between gap-6 md:justify-end">
          <FilesFilter
            filter={filter}
            setFilter={setFilter}
            types={fileTypes}
          />
          <ViewSwitch view={view} setView={setView} />
        </div>
      </div>
      <section id="files" className="relative" {...getRootProps()}>
        {isDragActive && (
          <svg
            className="absolute inset-0 z-50 size-full text-vermillion-900 animate-in fade-in"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6"
            preserveAspectRatio="xMidYMid meet"
          >
            <rect
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              x="1"
              y="1"
              rx="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="12;0"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </rect>
          </svg>
        )}
        {files.length === 0 && !isLoading ? (
          <FilesEmpty
            disabled={isUploadDisabled}
            uploadStatus={uploadButtonStatus}
            onUploadSuccess={onUploadSuccess}
          />
        ) : (
          <>
            {view === 'list' ? (
              <FilesTable files={filteredFiles} isLoading={isLoading} />
            ) : (
              <FilesGrid files={filteredFiles} isLoading={isLoading} />
            )}
          </>
        )}
      </section>
    </div>
  );
};
